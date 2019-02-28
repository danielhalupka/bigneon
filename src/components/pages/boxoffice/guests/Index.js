import React, { Component } from "react";
import { withStyles, Grid } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";

import Bigneon from "../../../../helpers/bigneon";
import notifications from "../../../../stores/notifications";
import boxOffice from "../../../../stores/boxOffice";
import GuestRow from "./GuestRow";
import BoxInput from "../../../elements/form/BoxInput";
import BottomCompleteOrderBar from "../common/BottomCompleteOrderBar";
import CheckingInDialog from "./CheckingInDialog";
import NotFound from "../../../common/NotFound";
import layout from "../../../../stores/layout";
import BlankSlate from "../common/BlankSlate";
import Loader from "../../../elements/loaders/Loader";
import { onAddItemsToCart } from "../common/helpers";
import cart from "../../../../stores/cart";
import CheckoutDialog from "../sales/CheckoutDialog";
import PurchaseSuccessOptionsDialog from "../sales/PurchaseSuccessOptionsDialog";
import SuccessDialog from "../sales/SuccessDialog";

const styles = theme => ({
	root: {},
	filterOptions: {
		marginBottom: theme.spacing.unit * 2
	}
});

@observer
class GuestList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			filteredGuests: null,
			searchQuery: "",
			expandedRowKey: null,
			selectedTickets: {},
			selectedHolds: {},
			isCheckingIn: false,
			showCheckingInDialog: false,
			showCheckoutModal: false,
			currentOrderDetails: null,
			successMessage: ""
		};

		this.onExpandChange = this.onExpandChange.bind(this);
		this.onTicketSelect = this.onTicketSelect.bind(this);
		this.onHoldSelect = this.onHoldSelect.bind(this);
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
			currentOrderDetails,
			isCheckingIn: false
		});

		boxOffice.refreshEventTickets();
	}

	stringContainedInArray(strList, searchQuery) {
		for (let index = 0; index < strList.length; index++) {
			const str = strList[index] ? strList[index].toLowerCase() : "";

			if (str.includes(searchQuery.toLowerCase())) {
				return true;
			}
		}

		return false;
	}

	filterGuestsOnQuery(e) {
		this.setState({
			searchQuery: e.target.value,
			expandedRowKey: null,
			selectedTickets: {},
			selectedHolds: {},
			currentOrderDetails: null
		});
	}

	filteredGuests() {
		const { guests, childHolds } = boxOffice;
		if (!guests || !childHolds) {
			return null;
		}

		//TODO filter holds also

		const { searchQuery } = this.state;

		//Filtering required
		const filteredGuests = {};
		Object.keys(guests).forEach(user_id => {
			const { first_name, last_name, tickets } = guests[user_id];
			const ticketIds = [];
			tickets.forEach(({ id }) => {
				ticketIds.push(id);
			});

			if (
				this.stringContainedInArray(
					[first_name, last_name, ...ticketIds],
					searchQuery
				)
			) {
				filteredGuests[user_id] = guests[user_id];
			}
		});

		const filteredHolds = {};
		Object.keys(childHolds).forEach(id => {
			const { name, redemption_code } = childHolds[id];
			if (
				this.stringContainedInArray(
					[name, redemption_code],
					searchQuery
				)
			) {
				filteredHolds[id] = childHolds[id];
			}
		});

		return { guests: filteredGuests, holds: filteredHolds };
	}

	onExpandChange(expandedRowKey) {
		this.setState({ expandedRowKey, selectedTickets: {}, selectedHolds: {} });
	}

	onTicketSelect({ id, ...ticket }) {
		this.setState(({ selectedTickets }) => {
			if (selectedTickets[id]) {
				delete selectedTickets[id];
			} else {
				selectedTickets[id] = ticket;
			}

			return { selectedTickets };
		});
	}

	onHoldSelect(index) {
		this.setState(({ selectedHolds }) => {
			if (selectedHolds[index]) {
				delete selectedHolds[index];
			} else {
				selectedHolds[index] = true;
			}

			return { selectedHolds };
		});
	}

	async redeemSingleTicket({ id, redeem_key, event_id }) {
		return new Promise(function(resolve, reject) {
			Bigneon()
				.events.tickets.redeem({
					event_id,
					ticket_id: id,
					redeem_key
				})
				.then(response => {
					resolve({ result: response });
				})
				.catch(error => {
					resolve({ error });
				});
		});
	}

	async onRedeemSelectedTickets() {
		this.setState({ isCheckingIn: true, showCheckingInDialog: true });

		const { selectedTickets } = this.state;
		const ticketIds = Object.keys(selectedTickets);

		for (let index = 0; index < ticketIds.length; index++) {
			const id = ticketIds[index];

			const { redeem_key, event_id } = selectedTickets[id];
			if (redeem_key) {
				const { error } = await this.redeemSingleTicket({
					id,
					redeem_key,
					event_id
				});

				if (error) {
					this.setState({ isCheckingIn: false, showCheckingInDialog: false });
					notifications.showFromErrorResponse({
						defaultMessage: "Redeeming ticket failed.",
						error
					});
				}
			} else {
				//No redeem key yet
				this.setState({ isCheckingIn: false, showCheckingInDialog: false });
				notifications.show({
					message: "Redeeming tickets for this event not yet allowed.",
					variant: "warning"
				});
			}
		}

		this.setState({ isCheckingIn: false, selectedTickets: {} });
		boxOffice.refreshGuests();
	}

	async onCheckoutHolds() {
		this.setState({ isCheckingIn: true });

		const { selectedHolds, expandedRowKey } = this.state;
		const { childHolds } = boxOffice;

		const quantity = Object.keys(selectedHolds).length;

		const {
			name,
			max_per_order,
			hold_type,
			discount_in_cents,
			available,
			redemption_code,
			ticket_type_id
		} = childHolds[expandedRowKey];

		const items = [{ quantity, ticket_type_id, redemption_code }];

		const { error } = await onAddItemsToCart(items);
		if (error) {
			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Failed to add to cart."
			});
			return this.setState({ isCheckingIn: false });
		}

		cart.refreshCart(() => {
			this.setState({ showCheckoutModal: true });
		});

	}

	renderBottomBar() {
		const {
			selectedTickets,
			selectedHolds,
			isCheckingIn,
			showCheckingInDialog,
			expandedRowKey,
			showCheckoutModal
		} = this.state;

		const { guests, childHolds } = boxOffice;

		let totalAvailable = 0;

		let totalNumberSelected = 0;
		let checkoutType;

		if (Object.keys(selectedTickets).length > 0) {
			checkoutType = "tickets";
			totalNumberSelected = Object.keys(selectedTickets).length;

			if (guests && guests[expandedRowKey]) {
				const { tickets } = guests[expandedRowKey];
				tickets.forEach(({ status }) => {
					if (status !== "Redeemed") {
						totalAvailable++;
					}
				});
			}
			
		} else if (Object.keys(selectedHolds).length > 0) {
			checkoutType = "holds";
			totalNumberSelected = Object.keys(selectedHolds).length;

			if (childHolds && childHolds[expandedRowKey]) {
				const { available } = childHolds[expandedRowKey];
				totalAvailable = available;
			}
		}

		const buttonText = `Check in ${
			totalNumberSelected ? totalNumberSelected : ""
		} ticket${totalNumberSelected > 1 ? "s" : ""}`;

		return (
			<div>
				<CheckingInDialog
					open={!!showCheckingInDialog}
					onClose={() => this.setState({ showCheckingInDialog: false })}
					isCheckingIn={isCheckingIn}
				/>
				<BottomCompleteOrderBar
					col1Text={`Total tickets available: ${totalAvailable}`}
					col3Text={`Total tickets selected: ${totalNumberSelected}`}
					disabled={isCheckingIn || !(totalNumberSelected > 0)}
					onSubmit={checkoutType === "tickets" ? this.onRedeemSelectedTickets.bind(this) : this.onCheckoutHolds.bind(this)}
					buttonText={buttonText}
					disabledButtonText={
						totalNumberSelected > 0 ? "Checking in..." : "Check in"
					}
				/>
			</div>
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

		if (boxOffice.childHolds !== null && Object.keys(boxOffice.childHolds).length === 0 && boxOffice.guests !== null && Object.keys(boxOffice.guests).length === 0) {
			return <BlankSlate>No guests found for event.</BlankSlate>;
		}

		const { searchQuery, expandedRowKey, selectedTickets, selectedHolds, showCheckoutModal, currentOrderDetails, successMessage, holdCheckoutType } = this.state;

		const { classes } = this.props;

		const filteredResults = this.filteredGuests();

		if (filteredResults === null) {
			return <Loader/>;
		}

		const { guests, holds } = filteredResults;
		const { ticketTypes } = boxOffice;
		const guestIndexOffset = Object.keys(holds).length; //For listing each row

		return (
			<div>
				<Grid className={classes.filterOptions} container>
					<Grid item xs={12} sm={12} md={6} lg={4}>
						<BoxInput
							name="Search"
							value={searchQuery}
							placeholder="Search by guest name or order #"
							onChange={this.filterGuestsOnQuery.bind(this)}
						/>
					</Grid>
				</Grid>

				{Object.keys(holds).map((id, index) => {
					const expanded = id === expandedRowKey;
					const {
						available,
						discount_in_cents,
						end_at,
						event_id,
						hold_type,
						max_per_order,
						name,
						quantity,
						redemption_code,
						ticket_type_id,
						price_in_cents,
						ticket_type_name
					} = holds[id];

					let discountedPriceInCents;
					if (!isNaN(price_in_cents) && !isNaN(discount_in_cents)) {
						discountedPriceInCents = price_in_cents - discount_in_cents;
					}

					return (
						<GuestRow
							key={id}
							rowKey={id}
							index={index}
							type={"hold"}
							name={name}
							available={available}
							hold_type={hold_type}
							discountedPriceInCents={discountedPriceInCents}
							ticketTypeName={ticket_type_name}
							onExpandChange={this.onExpandChange}
							expanded={expanded}
							onSelect={this.onHoldSelect}
							selectedHolds={expanded ? selectedHolds : {}}
						/>
					);
				})}

				{Object.keys(guests).map((id, index) => {
					const expanded = id === expandedRowKey;
					const { first_name, last_name, tickets } = guests[id];

					let name = `Guest (No Details Provided))`;
					if (first_name && last_name) {
						name = `${last_name}, ${first_name}`;
					} else if (first_name) {
						name = first_name;
					}

					return (
						<GuestRow
							key={id}
							rowKey={id}
							type={"guest"}
							name={name}
							tickets={tickets}
							index={index + guestIndexOffset}
							onExpandChange={this.onExpandChange}
							expanded={expanded}
							onSelect={this.onTicketSelect}
							selectedTickets={expanded ? selectedTickets : {}}
						/>
					);
				})}

				{ticketTypes ? (
					<div>
						<CheckoutDialog
							open={showCheckoutModal}
							onClose={() => this.setState({ showCheckoutModal: false, isCheckingIn: false })}
							ticketTypes={ticketTypes || {}}
							onSuccess={this.onCheckoutSuccess.bind(this)}
							onError={() => {
								this.setState({ isCheckingIn: false });
							}}
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

export default withStyles(styles)(GuestList);
