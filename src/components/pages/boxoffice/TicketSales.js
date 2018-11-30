import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import Bigneon from "../../../helpers/bigneon";
import notifications from "../../../stores/notifications";
import PageHeading from "../../elements/PageHeading";
import boxOffice from "../../../stores/boxOffice";
import TicketRow from "./TicketRow";
import BottomCheckoutBar from "./BottomCheckoutBar";
import CheckoutDialog from "./CheckoutDialog";
import cart from "../../../stores/cart";

const styles = theme => ({
	root: {}
});

class TicketSales extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ticketTypes: null,
			selectedTickets: {},
			showCheckoutModal: false,
			isAddingToCart: false
		};
	}

	componentDidMount() {
		this.loadTicketTypes();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	loadDevData() {
		//FIXME remove hard coded data
		const testId = "aee836e5-6e26-4986-ab54-7ac69539c534";
		if (
			process.env.REACT_APP_API_HOST === "localhost" &&
			this.state.ticketTypes[testId]
		) {
			this.setState(
				{
					selectedTickets: {
						[testId]: 2
					}
				},
				this.onAddToCart.bind(this)
			);
		}
	}

	loadTicketTypes() {
		const { activeEventId } = boxOffice;
		if (!activeEventId) {
			this.timeout = setTimeout(this.loadTicketTypes.bind(this), 500);
			return;
		}

		Bigneon()
			.events.read({ id: activeEventId })
			.then(response => {
				const { ticket_types } = response.data;

				let ticketTypes = {};
				ticket_types.forEach(({ id, ...ticket_type }) => {
					ticketTypes[id] = ticket_type;
				});

				this.setState({ ticketTypes }, this.loadDevData.bind(this)); //FIXME remove when done
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event ticket types failed."
				});
			});
	}

	onCheckoutSuccess(orderDetails) {
		this.setState({ selectedTickets: {} });

		//https://share.goabstract.com/05da9acb-1137-464a-90d1-3cbd474c6313
		console.log("TODO: Follow up options dialog");
		console.log(orderDetails);

		//We have the api calls for this already
		//-Transfer via SMS (same as in fan hub)
		//-Checking guests. Iterate through tickets, redeeming them
		//-View order (Will have those details in `orderDetails`)

		notifications.show({
			message: `Order complete. Follow up options coming soon.`,
			variant: "info"
		});
	}

	onAddToCart() {
		const { selectedTickets } = this.state;

		this.setState({ isAddingToCart: true });

		cart.replace(
			selectedTickets,
			() => {
				this.setState({ showCheckoutModal: true });
			},
			error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to add to cart."
				});
			}
		);
	}

	renderTicketTypes() {
		const { ticketTypes, selectedTickets } = this.state;

		if (ticketTypes === null) {
			return <Typography>Loading...</Typography>;
		}

		const ticketTypeIds = Object.keys(ticketTypes);

		if (ticketTypeIds.length === 0) {
			return <Typography />;
		}

		return ticketTypeIds.map(id => {
			const { name, available, ticket_pricing, ...rest } = ticketTypes[id];

			const { price_in_cents } = ticket_pricing;

			return (
				<TicketRow
					key={id}
					iconUrl="/icons/tickets-gray.svg"
					name={name}
					available={available}
					priceInCents={price_in_cents}
					value={selectedTickets[id]}
					onChange={value => {
						this.setState(({ selectedTickets }) => {
							return { selectedTickets: { ...selectedTickets, [id]: value } };
						});
					}}
				/>
			);
		});
	}

	renderBottomBar() {
		const { ticketTypes, selectedTickets, showCheckoutModal } = this.state;

		if (!ticketTypes || Object.keys(ticketTypes).length < 1) {
			return null;
		}

		let totalNumberSelected = 0;
		let totalInCents = 0;

		Object.keys(selectedTickets).forEach(id => {
			if (selectedTickets[id] > 0) {
				const { ticket_pricing, name } = ticketTypes[id];
				const { price_in_cents, fee_in_cents } = ticket_pricing;

				totalNumberSelected = totalNumberSelected + selectedTickets[id];
				totalInCents = totalInCents + price_in_cents * selectedTickets[id];
			}
		});

		return (
			<BottomCheckoutBar
				totalNumberSelected={totalNumberSelected}
				totalInCents={totalInCents}
				onCheckout={this.onAddToCart.bind(this)}
			/>
		);
	}

	render() {
		const { ticketTypes, showCheckoutModal } = this.state;

		return (
			<div>
				<PageHeading iconUrl="/icons/tickets-active.svg">
					General public
				</PageHeading>

				{this.renderTicketTypes()}

				{ticketTypes ? (
					<CheckoutDialog
						open={showCheckoutModal}
						onClose={() => this.setState({ showCheckoutModal: false })}
						ticketTypes={ticketTypes || {}}
						onSuccess={this.onCheckoutSuccess.bind(this)}
					/>
				) : null}

				{this.renderBottomBar()}
			</div>
		);
	}
}

export default withStyles(styles)(TicketSales);
