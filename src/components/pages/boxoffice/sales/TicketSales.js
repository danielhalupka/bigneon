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
import InputWithButton from "../../../common/form/InputWithButton";

const styles = theme => ({
	root: {},
	topRow: {
		display: "flex",
		justifyContent: "space-between"
	}
});

class TicketSales extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ticketTypes: null,
			selectedTickets: {},
			selectedHolds: {},
			holds: null,
			showCheckoutModal: false,
			isAddingToCart: false,
			currentOrderDetails: null,
			holdCode: "",
			successMessage: ""
		};
	}

	componentDidMount() {
		this.refreshTicketTypes();
		this.refreshHolds();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	refreshTicketTypes() {
		const { activeEventId } = boxOffice;
		if (!activeEventId) {
			this.timeout = setTimeout(this.refreshTicketTypes.bind(this), 500);
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

	refreshHolds() {
		const { activeEventId } = boxOffice;

		Bigneon()
			.events.holds.index({ event_id: activeEventId })
			.then(response => {
				const { data } = response.data;

				let holds = {};
				data.forEach(({ id, ...hold }) => {
					holds[id] = hold;
				});

				this.setState({ holds });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading ticket holds failed."
				});
			});
	}

	onCheckoutSuccess(currentOrderDetails) {
		this.setState({
			selectedTickets: {},
			selectedHolds: {},
			currentOrderDetails
		});
		this.refreshTicketTypes();
		this.refreshHolds();
	}

	async onAddItemsToCart(items) {
		return new Promise(function(resolve, reject) {
			Bigneon()
				.cart.replace({ items })
				.then(response => {
					const { data } = response;
					resolve({ result: data });
				})
				.catch(error => {
					resolve({ error });
				});
		});
	}

	async onCheckout() {
		const { selectedTickets, selectedHolds, ticketTypes, holds } = this.state;

		this.setState({ isAddingToCart: true });

		let items = [];

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

		const { error } = await this.onAddItemsToCart(items);
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
		const { ticketTypes, selectedTickets } = this.state;

		if (ticketTypes === null) {
			return <Typography>Loading tickets...</Typography>;
		}

		const ticketTypeIds = Object.keys(ticketTypes);

		if (ticketTypeIds.length === 0) {
			return <Typography>No tickets found</Typography>;
		}

		return ticketTypeIds.map(id => {
			const { name, available, ticket_pricing, ...rest } = ticketTypes[id];

			const { price_in_cents } = ticket_pricing;

			return (
				<TicketRow
					key={id}
					type={"ticket"}
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

	renderHolds() {
		const { holds, selectedHolds, ticketTypes, holdCode } = this.state;

		if (!ticketTypes) {
			return null;
		}

		if (holds === null) {
			return <Typography>Loading holds...</Typography>;
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
				redemption_code
			} = holds[id];

			console.log(name, ":  ", hold_type);
			console.log(holds[id]);

			if (holdCode && holdCode !== redemption_code) {
				return null;
			}

			const ticketType = ticketTypes[ticket_type_id];
			const { ticket_pricing } = ticketType;
			const { price_in_cents } = ticket_pricing;
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
				/>
			);
		});
	}

	renderBottomBar() {
		const {
			ticketTypes,
			selectedTickets,
			holds,
			selectedHolds,
			showCheckoutModal,
			isAddingToCart
		} = this.state;

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
		const {
			ticketTypes,
			showCheckoutModal,
			currentOrderDetails,
			successMessage,
			holdCode
		} = this.state;
		const { classes } = this.props;

		return (
			<div>
				<div className={classes.topRow}>
					<PageHeading iconUrl="/icons/fan-hub-active.svg">
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

				<br />
				<br />

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
