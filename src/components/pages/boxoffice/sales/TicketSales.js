import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import Bigneon from "../../../../helpers/bigneon";
import notifications from "../../../../stores/notifications";
import PageHeading from "../../../elements/PageHeading";
import boxOffice from "../../../../stores/boxOffice";
import TicketRow from "./TicketRow";
import BottomCompleteOrderBar from "../common/BottomCompleteOrderBar";
import CheckoutDialog from "./CheckoutDialog";
import cart from "../../../../stores/cart";
import PurchaseSuccessOptionsDialog from "./PurchaseSuccessOptionsDialog";
import SuccessDialog from "./SuccessDialog";

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
			isAddingToCart: false,
			currentOrderDetails: null,
			successMessage: ""
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

				this.setState({ ticketTypes });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event ticket types failed."
				});
			});
	}

	onCheckoutSuccess(currentOrderDetails) {
		this.setState({ selectedTickets: {}, currentOrderDetails });
	}

	onAddToCart() {
		const { selectedTickets } = this.state;

		this.setState({ isAddingToCart: true });

		cart.replace(
			selectedTickets,
			() => {
				this.setState({ showCheckoutModal: true, isAddingToCart: false });
			},
			error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to add to cart."
				});
				this.setState({ isAddingToCart: false });
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
		const {
			ticketTypes,
			selectedTickets,
			showCheckoutModal,
			isAddingToCart
		} = this.state;

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
			<BottomCompleteOrderBar
				col1Text={`Total tickets selected: ${totalNumberSelected}`}
				col3Text={`Order total: $${(totalInCents / 100).toFixed(2)}`}
				disabled={isAddingToCart || !(totalNumberSelected > 0)}
				onSubmit={this.onAddToCart.bind(this)}
				buttonText="Checkout"
				disabledButtonText={isAddingToCart ? "Adding to cart..." : "Checkout"}
			/>
		);
	}

	render() {
		const {
			ticketTypes,
			showCheckoutModal,
			currentOrderDetails,
			successMessage
		} = this.state;

		return (
			<div>
				<PageHeading iconUrl="/icons/tickets-active.svg">
					General public
				</PageHeading>
				{this.renderTicketTypes()}

				{ticketTypes ? (
					<div>
						<CheckoutDialog
							open={showCheckoutModal}
							onClose={() => this.setState({ showCheckoutModal: false })}
							ticketTypes={ticketTypes || {}}
							onSuccess={this.onCheckoutSuccess.bind(this)}
						/>

						<PurchaseSuccessOptionsDialog
							currentOrderDetails={currentOrderDetails}
							onClose={() => this.setState({ currentOrderDetails: null })}
							onCheckInSuccess={() =>
								this.setState({
									currentOrderDetails: null,
									successMessage: "Check-in complete"
								})
							}
							onTransferSuccess={() =>
								this.setState({
									currentOrderDetails: null,
									successMessage: "Transfer complete"
								})
							}
						/>

						<SuccessDialog
							message={successMessage}
							onClose={() => this.setState({ successMessage: "" })}
						/>
					</div>
				) : null}

				{this.renderBottomBar()}
			</div>
		);
	}
}

export default withStyles(styles)(TicketSales);
