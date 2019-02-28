import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { observer } from "mobx-react";
import PropTypes from "prop-types";

import Button from "../../elements/Button";
import notifications from "../../../stores/notifications";
import TicketSelection from "./TicketSelection";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import user from "../../../stores/user";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import { fontFamilyDemiBold } from "../../styles/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import InputWithButton from "../../common/form/InputWithButton";
import moment from "moment";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";

const styles = theme => ({
	root: {},
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4,
		[theme.breakpoints.down("sm")]: {
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2
		}
	},
	eventSubCardRow1: {
		// display: "flex",
		// justifyContent: "space-between"
	},
	eventSubCardHeading: {
		fontSize: theme.typography.fontSize * 1.5,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit * 4
	},
	eventSubCardDescription: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		fontSize: theme.typography.fontSize * 0.8,
		color: "#9da3b4",
		lineHeight: 1.5
	}
});

@observer
class CheckoutSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			ticketSelection: {},
			isSubmitting: false,
			isSubmittingPromo: false
		};
		this.onSubmit.bind(this);
	}

	componentDidMount() {
		setTimeout(() => {
			cart.refreshCart(() => {
				const { items } = cart;
				if (items && items.length > 0) {
					const ticketSelection = {};

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

					this.setState({ ticketSelection });
				}
			});
		}, 500); //TODO figure out why this needs to be delayed for it to work

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

	onSubmitPromo(code) {
		if (!code) {
			return notifications.show({
				message: "Enter a promo code first.",
				variant: "warning"
			});
		}

		this.setState({ isSubmittingPromo: true }, () => {
			selectedEvent.applyRedemptionCode(code, error => {
				this.setState({ isSubmittingPromo: false });

				if (error.response.status === 404) {
					notifications.show({
						message: "Promo code does not exist",
						variant: "error"
					});
				} else {
					const formattedError = notifications.showFromErrorResponse({
						error,
						defaultMessage: "Failed to apply promo code.",
						variant: "error"
					});

					console.error(error);
				}
			});
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

	renderTicketPricing() {
		const { ticket_types } = selectedEvent;
		const { ticketSelection, errors } = this.state;
		if (!ticket_types) {
			//TODO use a loader
			return <Loader>Loading tickets...</Loader>;
		}

		const ticketTypeRendered = ticket_types
			.map(
				({
					 id,
					 name,
					 ticket_pricing,
					 increment,
					 limit_per_person,
					 start_date,
					 end_date,
					 redemption_code,
					 available,
					 description
				 }) => {
					const nowIsValidTime = moment
						.utc()
						.isBetween(moment.utc(start_date), moment.utc(end_date));
					//Not in a valid date for this ticket_type
					if (!nowIsValidTime) {
						return;
					}

					let price = 0;
					let ticketsAvailable = false;
					if (ticket_pricing) {
						price = ticket_pricing.price_in_cents / 100;
						ticketsAvailable = available > 0;
					} else {
						//description = "(Tickets currently unavailable)";
					}
					const limitPerPerson = Math.min(available, limit_per_person);

					return (
						<TicketSelection
							key={id}
							name={name}
							description={description}
							available={ticketsAvailable}
							price={price}
							error={errors[id]}
							amount={ticketSelection[id] ? ticketSelection[id].quantity : 0}
							increment={increment}
							limitPerPerson={limitPerPerson}
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
				}
			)
			.filter(item => !!item);

		if (!ticketTypeRendered.length) {
			return (
				<Typography variant="subheading">
					Tickets currently unavailable
				</Typography>
			);
		}
		return ticketTypeRendered;
	}

	render() {
		const { classes } = this.props;
		const { isSubmitting, isSubmittingPromo } = this.state;

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

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			promo_image_url,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment
		} = event;

		const subCardContent = (
			<div className={classes.eventSubCardContent}>
				<div className={classes.eventSubCardRow1}>
					<Typography className={classes.eventSubCardHeading}>
						Purchase tickets
					</Typography>

					{/*<Typography className={classes.eventSubCardDescription}>*/}
					{/*{additional_info}*/}
					{/*</Typography>*/}
				</div>

				{this.renderTicketPricing()}

				<InputWithButton
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
					{isSubmitting ? "Adding..." : "Select tickets"}
				</Button>
			</div>
		);

		const headerHeight = 600;

		return (
			<div>
				<Meta type={"selection"} {...event}/>

				<EventHeaderImage
					variant="detailed"
					height={headerHeight}
					{...event}
					artists={artists}
				/>

				{/* Desktop */}
				<div style={{ height: headerHeight }}>
					<Hidden smDown implementation="css">
						<EventDetailsOverlayCard
							style={{
								width: "30%",
								maxWidth: 550,
								top: 180,
								right: 200,
								height: "100%"
							}}
							imageSrc={promo_image_url}
						>
							{subCardContent}
						</EventDetailsOverlayCard>
					</Hidden>

					{/* Mobile */}
					<Hidden mdUp>
						<EventDetailsOverlayCard
							style={{
								width: "100%",
								paddingLeft: 20,
								paddingRight: 20,
								top: 480
							}}
							imageSrc={promo_image_url}
						>
							{subCardContent}
						</EventDetailsOverlayCard>
					</Hidden>
				</div>
			</div>
		);
	}
}

CheckoutSelection.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSelection);
