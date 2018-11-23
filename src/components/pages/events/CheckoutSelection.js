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
import layout from "../../../stores/layout";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import { fontFamilyDemiBold } from "../../styles/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import InputWithButton from "../../common/form/InputWithButton";

const styles = theme => ({
	root: {},
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4
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
	}

	componentDidMount() {
		layout.toggleSideMenu(false);
		layout.toggleContainerPadding(false);

		setTimeout(() => {
			cart.refreshCart(() => {
				const { items } = cart;
				if (items && items.length > 0) {
					let ticketSelection = {};

					items.forEach(({ ticket_type_id, quantity }) => {
						if (ticket_type_id) {
							ticketSelection[ticket_type_id] = ticketSelection[ticket_type_id]
								? ticketSelection[ticket_type_id] + quantity
								: quantity;
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

	componentWillUnmount() {
		layout.toggleContainerPadding(true);
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { ticketSelection } = this.state;
		const { ticket_types } = selectedEvent;

		let errors = {};

		Object.keys(ticketSelection).forEach(ticketTypeId => {
			const selectedTicketCount = ticketSelection[ticketTypeId];
			if (selectedTicketCount && selectedTicketCount > 0) {
				//Validate the user is buying in the correct increments
				const { increment } = ticket_types.find(({ id }) => {
					return id === ticketTypeId;
				});

				if (selectedTicketCount % increment !== 0) {
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
			setTimeout(() => {
				notifications.show({
					message: "Feature coming soon.",
					variant: "info"
				});

				this.setState({ isSubmittingPromo: false });
			}, 2000);
		});

		//TODO this isn't in the API yet so needs tweaking when the API endpoint is available
		// Bigneon().cart.applyPromo({code})
		// 	.then(response => {
		// 		const { value } = response.data;

		// 		onSuccess(value);
		// 	})
		// 	.catch(error => {
		// 		let message = "Promo code check failed.";

		// 		if (
		// 			error.response &&
		// 			error.response.data &&
		// 			error.response.data.error
		// 		) {
		// 			message = error.response.data.error;
		// 		}
		// 		this.setState({ isSubmitting: false, error: message });
		// 	});
	}

	onSubmit() {
		const { id } = selectedEvent;
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

		let emptyCart = true;
		Object.keys(ticketSelection).forEach(ticketTypeId => {
			if (ticketSelection[ticketTypeId] && ticketSelection[ticketTypeId] > 0) {
				emptyCart = false;
			}
		});

		if (emptyCart) {
			notifications.show({
				message: "Select tickets first."
			});
			return;
		}

		this.setState({ isSubmitting: true });
		cart.update(
			ticketSelection,
			() => {
				this.props.history.push(`/events/${id}/tickets/confirmation`);
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
			return null; //Still loading this
		}

		return ticket_types.map(
			({ id, name, status, ticket_pricing, increment, limit_per_person }) => {
				// console.log("limit_per_person: ", limit_per_person);
				let description = "";
				let price = 0;
				if (ticket_pricing) {
					price = ticket_pricing.price_in_cents / 100;
					description = ticket_pricing.name;
				} else {
					description = "(Tickets currently unavailable)";
				}

				return (
					<TicketSelection
						key={id}
						name={name}
						description={description}
						available={!!ticket_pricing}
						price={price}
						error={errors[id]}
						amount={ticketSelection[id]}
						increment={increment}
						limitPerPerson={limit_per_person}
						onNumberChange={amount =>
							this.setState(({ ticketSelection }) => {
								ticketSelection[id] = Number(amount) < 0 ? 0 : amount;
								return { ticketSelection };
							})
						}
						validateFields={this.validateFields.bind(this)}
					/>
				);
			}
		);
	}

	render() {
		const { classes } = this.props;
		const { isSubmitting, isSubmittingPromo } = this.state;

		const { event, venue, artists, organization, id } = selectedEvent;

		if (event === null) {
			return <Typography variant="subheading">Loading...</Typography>;
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

					<Typography className={classes.eventSubCardDescription}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in
						lacus non magna tincidunt lacinia.
					</Typography>
				</div>

				{this.renderTicketPricing()}

				<InputWithButton
					style={{ marginBottom: 20, marginTop: 20 }}
					name={"promoCode"}
					placeholder="Enter a promo code"
					buttonText="Apply"
					onSubmit={this.onSubmitPromo.bind(this)}
					disabled={isSubmittingPromo}
				/>

				<Button
					disabled={isSubmitting}
					onClick={this.onSubmit.bind(this)}
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
