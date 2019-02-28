import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";

import notifications from "../../../../stores/notifications";
import PageHeading from "../../../elements/PageHeading";
import boxOffice from "../../../../stores/boxOffice";
import TicketRow from "./TicketRow";
import BottomCompleteOrderBar from "../common/BottomCompleteOrderBar";
import CheckoutDialog from "./CheckoutDialog";
import cart from "../../../../stores/cart";
import PurchaseSuccessOptionsDialog from "./PurchaseSuccessOptionsDialog";
import SuccessDialog from "./SuccessDialog";
import InputWithButton from "../../../common/form/InputWithButton";
import NotFound from "../../../common/NotFound";
import layout from "../../../../stores/layout";
import BlankSlate from "../common/BlankSlate";
import Loader from "../../../elements/loaders/Loader";
import { onAddItemsToCart } from "../common/helpers";

const styles = theme => ({
	root: {},
	topRow: {
		display: "flex",
		justifyContent: "space-between"
	}
});

@observer
class TicketSales extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedTickets: {},
			selectedHolds: {},
			showCheckoutModal: false,
			isAddingToCart: false,
			currentOrderDetails: null,
			holdCode: "",
			successMessage: "",
			eventSelected: null
		};
	}

	componentDidMount() {
		boxOffice.refreshEventTickets();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	onCheckoutSuccess(currentOrderDetails) {
		this.setState({
			selectedTickets: {},
			selectedHolds: {},
			currentOrderDetails
		});

		boxOffice.refreshEventTickets();
	}

	async onCheckout() {
		const { selectedTickets, selectedHolds } = this.state;
		const { holds } = boxOffice;

		this.setState({ isAddingToCart: true });

		const items = [];

		//Add all plain tickets to items
		Object.keys(selectedTickets).forEach(ticket_type_id => {
			const quantity = selectedTickets[ticket_type_id];
			if (quantity > 0) {
				items.push({ quantity, ticket_type_id });
			}
		});

		//Iterate through each hold to apply the discount code separately
		Object.keys(selectedHolds).forEach(holdId => {
			const quantity = selectedHolds[holdId];

			const hold = holds[holdId];
			const { ticket_type_id, redemption_code } = hold;

			if (quantity > 0) {
				items.push({ quantity, ticket_type_id, redemption_code });
			}
		});

		const { error } = await onAddItemsToCart(items);
		if (error) {
			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Failed to add to cart."
			});
			return this.setState({ isAddingToCart: false });
		}

		cart.refreshCart(() => {
			this.setState({ showCheckoutModal: true, isAddingToCart: false });
		});
	}

	renderTicketTypes() {
		const { selectedTickets } = this.state;
		const { status } = boxOffice.activeEventDetails;
		const { ticketTypes } = boxOffice;

		if (ticketTypes === null) {
			return <Loader>Loading tickets...</Loader>;
		}

		const ticketTypeIds = Object.keys(ticketTypes);

		if (ticketTypeIds.length === 0) {
			return <Typography>No tickets found</Typography>;
		}

		return ticketTypeIds.map(id => {
			const { name, available, ticket_pricing, ...rest } = ticketTypes[id];

			let disabled = false;
			let price_in_cents = 0;
			if (ticket_pricing && status === "Published") {
				price_in_cents = ticket_pricing.price_in_cents;
			} else {
				disabled = true; //No pricing yet so ticket probably not available for sale yet
			}

			return (
				<TicketRow
					key={id}
					type={"ticket"}
					iconUrl="/icons/tickets-gray.svg"
					name={name}
					available={available}
					priceInCents={price_in_cents}
					value={selectedTickets[id]}
					disabled={disabled}
					onChange={value => {
						this.setState(({ selectedTickets }) => {
							return { selectedTickets: { ...selectedTickets, [id]: value } };
						});
					}}
				/>
			);
		});
	}

	renderHolds() {
		const { selectedHolds, holdCode } = this.state;
		const { ticketTypes, holds } = boxOffice;

		if (!ticketTypes) {
			return null;
		}

		if (holds === null) {
			return <Loader>Loading holds...</Loader>;
		}

		const holdIds = Object.keys(holds);

		if (holdIds.length === 0) {
			return <Typography>No holds found</Typography>;
		}

		return holdIds.map(id => {
			const {
				name,
				quantity,
				available,
				discount_in_cents,
				hold_type,
				max_per_order,
				ticket_type_id,
				redemption_code,
				price_in_cents,
				ticket_type_name,
				...rest
			} = holds[id];
			
			if (holdCode && holdCode !== redemption_code) {
				return null;
			}

			const disabled = false;
			const discountedPrice = price_in_cents - discount_in_cents;

			return (
				<TicketRow
					key={id}
					type={hold_type.toLowerCase()}
					iconUrl="/icons/tickets-gray.svg"
					name={name}
					available={available}
					priceInCents={discountedPrice}
					value={selectedHolds[id]}
					onChange={value => {
						this.setState(({ selectedHolds }) => {
							return { selectedHolds: { ...selectedHolds, [id]: value } };
						});
					}}
					disabled={disabled}
				/>
			);
		});
	}

	renderBottomBar() {
		const {
			selectedTickets,
			selectedHolds,
			showCheckoutModal,
			isAddingToCart
		} = this.state;

		const { ticketTypes, holds } = boxOffice;

		if (!ticketTypes || Object.keys(ticketTypes).length < 1) {
			return null;
		}

		let totalNumberSelected = 0;
		let totalInCents = 0;

		//Calculate totals from tickets
		Object.keys(selectedTickets).forEach(id => {
			if (selectedTickets[id] > 0) {
				const { ticket_pricing, name } = ticketTypes[id];
				const { price_in_cents, fee_in_cents } = ticket_pricing;

				totalNumberSelected = totalNumberSelected + selectedTickets[id];
				totalInCents = totalInCents + price_in_cents * selectedTickets[id];
			}
		});

		//Calculate totals from holds
		Object.keys(selectedHolds).forEach(id => {
			if (selectedHolds[id] > 0) {
				const { ticket_type_id, discount_in_cents, hold_type } = holds[id];

				totalNumberSelected = totalNumberSelected + selectedHolds[id];

				if (hold_type !== "Comp") {
					const { ticket_pricing } = ticketTypes[ticket_type_id];
					const { price_in_cents } = ticket_pricing;
					const discountedPrice = price_in_cents - discount_in_cents;
					totalInCents = totalInCents + discountedPrice * selectedHolds[id];
				}
			}
		});

		return (
			<BottomCompleteOrderBar
				col1Text={`Total tickets selected: ${totalNumberSelected}`}
				col3Text={`Order total: $${(totalInCents / 100).toFixed(2)}`}
				disabled={isAddingToCart || !(totalNumberSelected > 0)}
				onSubmit={this.onCheckout.bind(this)}
				buttonText="Checkout"
				disabledButtonText={isAddingToCart ? "Adding to cart..." : "Checkout"}
			/>
		);
	}

	render() {
		if (!layout.allowedBoxOffice) {
			return <NotFound/>;
		}

		if (!boxOffice.availableEvents || boxOffice.availableEvents < 1) {
			return <BlankSlate>No active events found.</BlankSlate>;
		}

		if (!boxOffice.activeEventId) {
			return <BlankSlate>No active event selected.</BlankSlate>;
		}

		const {
			showCheckoutModal,
			currentOrderDetails,
			successMessage,
			holdCode
		} = this.state;

		const { ticketTypes } = boxOffice;

		const { classes } = this.props;

		return (
			<div>
				<div className={classes.topRow}>
					<PageHeading iconUrl="/icons/my-events-active.svg">
						General public
					</PageHeading>

					<InputWithButton
						style={{ maxWidth: 300 }}
						name={"promoCode"}
						placeholder="Enter a code"
						buttonText={"Apply"}
						onSubmit={newCode =>
							this.setState({ holdCode: holdCode ? "" : newCode })
						}
						onClear={() => this.setState({ holdCode: "" })}
						showClearButton={!!holdCode}
						toUpperCase
					/>
				</div>

				{this.renderTicketTypes()}

				<br/>
				<br/>

				<PageHeading iconUrl="/icons/tickets-active.svg">
					Holds {holdCode ? `(for code '${holdCode}')` : ""}
				</PageHeading>
				{this.renderHolds()}

				{ticketTypes ? (
					<div>
						<CheckoutDialog
							open={showCheckoutModal}
							onClose={() => this.setState({ showCheckoutModal: false })}
							ticketTypes={ticketTypes || {}}
							onSuccess={this.onCheckoutSuccess.bind(this)}
							onError={() => this.setState({ isAddingToCart: false })}
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
									successMessage: "Transfer link sent"
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
