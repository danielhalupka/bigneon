import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";
import PropTypes from "prop-types";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import TransactionRow from "./TransactionRow";
import TransactionDialog from "./TransactionDialog";

const styles = theme => ({
	root: {}
});

const dollars = cents => `$ ${(cents / 100).toFixed(2)}`;

class Transactions extends Component {
	constructor(props) {
		super(props);

		this.state = { items: null };
	}

	componentDidMount() {
		this.refreshData();
	}

	refreshData() {
		//TODO date filter
		//start_utc
		//end_utc

		const { eventId, organizationId } = this.props;

		let queryParams = { organization_id: organizationId };

		if (eventId) {
			queryParams = { ...queryParams, event_id: eventId };
		}

		Bigneon()
			.reports.transactionDetails(queryParams)
			.then(response => {
				let items = [];
				let eventFees = {};

				response.data.forEach(item => {
					const transaction_date = moment(transaction_date).format(
						"MM/DD/YYYY hh:MM:A"
					);

					if (item.ticket_name === "Per Event Fees") {
						eventFees[item.order_id] = item;
					} else {
						items.push({ ...item, transaction_date });
					}
				});

				items.forEach(row => {
					let eventFeeGrossInCents = 0;
					let eventFeeCompanyInCents = 0;
					let eventFeeClientInCents = 0;
					if (eventFees.hasOwnProperty(row.order_id)) {
						eventFeeGrossInCents = eventFees[row.order_id].gross;
						eventFeeCompanyInCents =
							eventFees[row.order_id].company_fee_in_cents;
						eventFeeClientInCents = eventFees[row.order_id].client_fee_in_cents;
					}
					row.event_fee_gross_in_cents = eventFeeGrossInCents;
					row.event_fee_company_in_cents = eventFeeCompanyInCents;
					row.event_fee_client_in_cents = eventFeeClientInCents;
				});

				this.setState({ items });
			})
			.catch(error => {
				console.error(error);
				this.setState({ items: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event transaction report failed."
				});
			});
	}

	renderDialog() {
		const { activeIndex, items } = this.state;

		let userId = null;
		let activeItem = null;

		if (!isNaN(activeIndex) && items) {
			const item = items[activeIndex];
			if (item) {
				activeItem = item;
				const { user_id } = item;
				if (user_id) {
					userId = user_id;
				}
			}
		}

		return (
			<TransactionDialog
				open={!!activeItem}
				userId={userId}
				item={activeItem}
				onClose={() => this.setState({ activeIndex: null })}
			/>
		);
	}

	render() {
		const { items, hoverIndex } = this.state;

		if (items === false) {
			//Query failed
			return null;
		}

		if (items === null) {
			return <Typography>Loading...</Typography>;
		}

		if (items.length === 0) {
			return <Typography>No transactions found.</Typography>;
		}

		const ths = [
			"Quantity",
			"Ticket name",
			"Order type",
			"Time",
			"Unit price",
			"Gross",
			"Company fee",
			"Client fee"
		];

		return (
			<div>
				{this.renderDialog()}

				<TransactionRow heading>{ths}</TransactionRow>

				{items.map((item, index) => {
					const {
						client_fee_in_cents,
						company_fee_in_cents,
						event_fee_gross_in_cents,
						event_fee_company_in_cents,
						event_fee_client_in_cents,
						event_id,
						event_name,
						gross,
						order_id,
						order_type,
						payment_method,
						quantity,
						redemption_code,
						ticket_name,
						transaction_date,
						unit_price_in_cents,
						user_id
					} = item;

					const tds = [
						quantity,
						ticket_name,
						order_type,
						transaction_date,
						dollars(unit_price_in_cents),
						dollars(gross),
						dollars(company_fee_in_cents),
						dollars(client_fee_in_cents)
					];

					return (
						<TransactionRow
							key={index}
							onClick={() => this.setState({ activeIndex: index })}
							onMouseEnter={() => this.setState({ hoverIndex: index })}
							onMouseLeave={() => this.setState({ hoverIndex: null })}
							active={false}
							gray={!(index % 2)}
							active={hoverIndex === index}
						>
							{tds}
						</TransactionRow>
					);
				})}
			</div>
		);
	}
}

Transactions.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string
};

export default withStyles(styles)(Transactions);
