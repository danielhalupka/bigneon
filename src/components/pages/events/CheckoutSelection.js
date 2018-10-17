import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";

import Button from "../../common/Button";
import notifications from "../../../stores/notifications";
import TicketSelection from "./TicketSelection";
import PromoCodeDialog from "./PromoCodeDialog";
import selectedEvent from "../../../stores/selectedEvent";
import EventSummaryGrid from "./EventSummaryGrid";
import cart from "../../../stores/cart";
import user from "../../../stores/user";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	buttonsContainer: {
		justifyContent: "flex-end",
		display: "flex"
	}
});

@observer
class CheckoutSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			openPromo: false,
			ticketSelection: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		cart.refreshCart();

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
		cart.addToCart(
			ticketSelection,
			() => {
				notifications.show({
					message: "Tickets added to cart",
					variant: "success"
				});
				this.props.history.push(`/events/${id}/tickets/confirmation`);
			},
			error => {
				this.setState({ isSubmitting: false });

				let message = "Adding to cart failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
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
			({ id, name, status, ticket_pricing, increment }) => {
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
		const { openPromo, isSubmitting } = this.state;

		const { event, venue, artists, organization, id } = selectedEvent;

		if (event === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		return (
			<Paper className={classes.card}>
				<EventSummaryGrid
					event={event}
					venue={venue}
					organization={organization}
					artists={artists}
				/>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{this.renderTicketPricing()}

						<div className={classes.buttonsContainer}>
							<Button
								onClick={() => this.setState({ openPromo: true })}
								size="large"
								customClassName="default"
							>
								Apply promo code
							</Button>
							&nbsp;
							<Button
								disabled={isSubmitting}
								onClick={this.onSubmit.bind(this)}
								size="large"
								customClassName="primary"
							>
								{isSubmitting ? "Adding..." : "Select tickets"}
							</Button>
						</div>

						<PromoCodeDialog
							open={openPromo}
							onCancel={() => this.setState({ openPromo: false })}
							onSuccess={discount => {
								console.log(discount);
								this.setState({ openPromo: false });
							}}
						/>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

CheckoutSelection.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSelection);
