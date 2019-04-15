import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import moment from "moment";

import Button from "../../elements/Button";
import notifications from "../../../stores/notifications";
import TicketSelection from "./TicketSelection";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import user from "../../../stores/user";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import { fontFamilyDemiBold } from "../../../config/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import InputWithButton from "../../common/form/InputWithButton";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";
import Divider from "../../common/Divider";
import TwoColumnLayout from "./TwoColumnLayout";
import EventDescriptionBody from "./EventDescriptionBody";
import getUrlParam from "../../../helpers/getUrlParam";
import { Redirect } from "react-router-dom";

const styles = theme => ({
	root: {},
	mobileContainer: {
		background: "#FFFFFF",
		padding: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 10
	},
	mobileHeading: {
		fontSize: theme.typography.fontSize * 1.25,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	desktopContent: {
		backgroundColor: "#FFFFFF"
	},
	desktopCardContent: {
		padding: theme.spacing.unit * 2
	}
});

@observer
class CheckoutSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			ticketSelection: null,
			isSubmitting: false,
			isSubmittingPromo: false,
			overlayCardHeight: 600
		};
	}

	componentDidMount() {
		const code = getUrlParam("code");
		code ? (selectedEvent.currentlyAppliedCode = code) : null;

		//If we have a current cart in the store already, load that right away
		if (cart.items && cart.items.length > 0) {
			this.setTicketSelectionFromExistingCart(cart.items);
		} else {
			//Else if we don't have any items in the cart, refresh to make sure
			cart.refreshCart(
				() => {
					this.setTicketSelectionFromExistingCart(cart.items);
				},
				error => {
					//If they're not logged in, assume an empty cart
					if (user.isAuthenticated) {
						notifications.showFromErrorResponse({
							defaultMessage: "Failed add to existing cart items.",
							error
						});
					}

					if (!this.state.ticketSelection) {
						this.setState({ ticketSelection: {} });
					}
				}
			);
		}

		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	setTicketSelectionFromExistingCart(items) {
		const ticketSelection = {};

		if (items && items.length > 0) {
			items.forEach(({ ticket_type_id, quantity, redemption_code }) => {
				if (ticket_type_id) {
					ticketSelection[ticket_type_id] = {
						quantity: ticketSelection[ticket_type_id]
							? ticketSelection[ticket_type_id] + quantity
							: quantity,
						redemption_code: redemption_code
					};
				}
			});
		}

		//Auto add one ticket if there is only one
		const { ticket_types } = selectedEvent;
		if (
			(items === undefined || items.length === 0) &&
			ticket_types &&
			ticket_types.length === 1
		) {
			const { id } = ticket_types[0];

			if (!ticketSelection[id]) {
				ticketSelection[id] = {
					quantity: 2
				};
			}
		}

		this.setState({ ticketSelection });
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { ticketSelection } = this.state;
		const { ticket_types } = selectedEvent;

		const errors = {};

		Object.keys(ticketSelection).forEach(ticketTypeId => {
			const selectedTicketCount = ticketSelection[ticketTypeId];
			if (selectedTicketCount && selectedTicketCount.quantity > 0) {
				//Validate the user is buying in the correct increments
				const ticketType = ticket_types.find(({ id }) => {
					return id === ticketTypeId;
				});

				const increment = ticketType ? ticketType.increment : 1;

				if (selectedTicketCount.quantity % increment !== 0) {
					errors[ticketTypeId] = `Please order in increments of ${increment}`;
				}
			}
		});

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	clearAppliedPromoCodes() {
		//Remove codes from selected tickets to not apply them when adding to cart
		this.setState(({ ticketSelection }) => {
			if (ticketSelection) {
				Object.keys(ticketSelection).forEach(id => {
					if (ticketSelection[id]) {
						delete ticketSelection[id].redemption_code;
					}
				});
			}

			return { ticketSelection };
		});

		//Remove from ticket types in store
		selectedEvent.removePromoCodesFromTicketTypes();
	}

	onSubmitPromo(code) {
		if (!code) {
			return notifications.show({
				message: "Enter a promo code first.",
				variant: "warning"
			});
		}

		this.setState({ isSubmittingPromo: true }, () => {
			selectedEvent.applyRedemptionCode(
				code,
				null,
				appliedCodes => {
					//after applying, update redemption_code in ticketSelection
					if (appliedCodes && Object.keys(appliedCodes).length > 0) {
						this.setState(({ ticketSelection }) => {
							Object.keys(appliedCodes).forEach(id => {
								if (ticketSelection[id]) {
									ticketSelection[id].redemption_code = appliedCodes[id];
								}
							});

							return { ticketSelection, isSubmittingPromo: false };
						});
					}
				},
				() => {
					this.setState({ isSubmittingPromo: false });
				}
			);
		});
	}

	onSubmit() {
		const { id } = selectedEvent;
		cart.setLatestEventId(id);
		const { ticketSelection } = this.state;

		this.submitAttempted = true;
		if (!this.validateFields()) {
			console.warn("Validation errors: ");
			console.warn(this.state.errors);
			return false;
		}

		if (!user.isAuthenticated) {
			//Show dialog for the user to signup/login, try again on success
			user.showAuthRequiredDialog(this.onSubmit.bind(this));
			return;
		}

		let emptySelection = true;
		Object.keys(ticketSelection).forEach(ticketTypeId => {
			if (
				ticketSelection[ticketTypeId] &&
				ticketSelection[ticketTypeId].quantity > 0
			) {
				emptySelection = false;
			}
		});

		//If the existing cart is empty and they haven't selected anything
		if (cart.ticketCount === 0 && emptySelection) {
			return notifications.show({
				message: "Select tickets first."
			});
		}

		this.setState({ isSubmitting: true });

		cart.replace(
			ticketSelection,
			() => {
				if (!emptySelection) {
					this.props.history.push(`/events/${id}/tickets/confirmation`);
				} else {
					//They had something in their cart, but they removed and updated
					this.setState({ isSubmitting: false });
				}
			},
			error => {
				this.setState({ isSubmitting: false });

				const formattedError = notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to add to cart.",
					variant: "error"
				});

				console.error(formattedError);
			}
		);
	}

	onOverlayCardHeightChange(overlayCardHeight) {
		this.setState({ overlayCardHeight });
	}

	renderTicketPricing() {
		const { ticket_types } = selectedEvent;
		const { ticketSelection, errors } = this.state;
		if (!ticket_types) {
			return <Loader>Loading tickets...</Loader>;
		}

		const ticketTypeRendered = ticket_types
			.map(ticketType => {
				const {
					id,
					name,
					ticket_pricing,
					increment,
					limit_per_person,
					start_date,
					end_date,
					redemption_code,
					available,
					description,
					discount_as_percentage
				} = ticketType;

				const nowIsValidTime = start_date
					? moment.utc().isBetween(moment.utc(start_date), moment.utc(end_date))
					: moment.utc().isBefore(moment.utc(end_date));
				//Not in a valid date for this ticket_type

				if (!nowIsValidTime) {
					return;
				}

				let price_in_cents = 0;
				let ticketsAvailable = false;
				let discount_in_cents = 0;
				if (ticket_pricing) {
					price_in_cents = ticket_pricing.price_in_cents;
					ticketsAvailable = available > 0;
					discount_in_cents = ticket_pricing.discount_in_cents || 0;
				} else {
					//description = "(Tickets currently unavailable)";
				}

				//0 is returned for limit_per_person when there is no limit
				const limitPerPerson =
					limit_per_person > 0
						? Math.min(available, limit_per_person)
						: available;

				return (
					<TicketSelection
						key={id}
						name={name}
						description={description}
						available={ticketsAvailable}
						price_in_cents={price_in_cents}
						error={errors[id]}
						amount={ticketSelection[id] ? ticketSelection[id].quantity : 0}
						increment={increment}
						limitPerPerson={limitPerPerson}
						discount_in_cents={discount_in_cents}
						discount_as_percentage={discount_as_percentage}
						redemption_code={redemption_code}
						onNumberChange={amount =>
							this.setState(({ ticketSelection }) => {
								ticketSelection[id] = {
									quantity: Number(amount) < 0 ? 0 : amount,
									redemption_code
								};
								return { ticketSelection };
							})
						}
						validateFields={this.validateFields.bind(this)}
					/>
				);
			})
			.filter(item => !!item);

		if (!ticketTypeRendered.length) {
			return null;
		}
		return ticketTypeRendered;
	}

	render() {
		const { classes } = this.props;
		const { isSubmitting, isSubmittingPromo, ticketSelection } = this.state;

		const { event, venue, artists, organization, id } = selectedEvent;

		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		if (event.is_external) {
			return <Redirect to={`/events/${id}`}/>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment
		} = event;

		const promo_image_url = event.promo_image_url
			? optimizedImageUrl(event.promo_image_url)
			: null;

		const mobilePromoImageStyle = {};
		if (promo_image_url) {
			mobilePromoImageStyle.backgroundImage = `url(${promo_image_url})`;
		}

		const promoCodeApplied = !!selectedEvent.currentlyAppliedCode;

		let sharedContent;

		if (ticketSelection === null) {
			sharedContent = (
				<Loader style={{ marginTop: 40, marginBottom: 40 }}>
					Loading cart...
				</Loader>
			);
		} else {
			sharedContent = (
				<div>
					<Typography className={classes.mobileHeading}>
						Select tickets
					</Typography>

					<Divider style={{ margin: 0 }}/>

					{this.renderTicketPricing()}

					<InputWithButton
						value={selectedEvent.currentlyAppliedCode}
						clearText={"Remove"}
						onClear={this.clearAppliedPromoCodes.bind(this)}
						successState={promoCodeApplied}
						showClearButton={promoCodeApplied}
						iconUrl={promoCodeApplied ? "/icons/checkmark-active.svg" : null}
						iconStyle={{ height: 15, width: "auto" }}
						style={{ marginBottom: 20, marginTop: 20 }}
						name={"promoCode"}
						placeholder="Enter a promo code"
						buttonText="Apply"
						onSubmit={this.onSubmitPromo.bind(this)}
						disabled={isSubmittingPromo}
						toUpperCase
					/>

					<Button
						disabled={isSubmitting}
						onClick={() => this.onSubmit()}
						size="large"
						style={{ width: "100%" }}
						variant="callToAction"
					>
						{isSubmitting ? "Adding..." : "Continue"}
					</Button>
				</div>
			);
		}

		//On mobile we need to move the description and artist details down. But we don't know how much space the overlayed div will take.
		const { overlayCardHeight } = this.state;
		const overlayCardHeightAdjustment = overlayCardHeight - 150;

		return (
			<div>
				<Meta type={"selection"} {...event}/>

				{/*DESKTOP*/}
				<Hidden smDown>
					<EventHeaderImage {...event} artists={artists}/>
					<TwoColumnLayout
						containerClass={classes.desktopContent}
						containerStyle={{ minHeight: overlayCardHeightAdjustment }}
						col1={(
							<EventDescriptionBody artists={artists}>
								{additional_info}
							</EventDescriptionBody>
						)}
						col2={(
							<EventDetailsOverlayCard
								style={{
									width: "100%",
									top: -310,
									position: "relative"
								}}
								imageSrc={promo_image_url}
								onHeightChange={this.onOverlayCardHeightChange.bind(this)}
							>
								<div className={classes.desktopCardContent}>
									{sharedContent}
								</div>
							</EventDetailsOverlayCard>
						)}
					/>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<div className={classes.mobileContainer}>{sharedContent}</div>
				</Hidden>
			</div>
		);
	}
}

CheckoutSelection.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSelection);
