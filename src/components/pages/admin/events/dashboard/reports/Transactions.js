import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import user from "../../../../../../stores/user";
import Divider from "../../../../../common/Divider";
import Container from "../Container";
import TransactionRow from "./TransactionRow";
import TransactionDialog from "./TransactionDialog";

const styles = theme => ({
	root: {}
});

const dollars = cents => `$ ${(cents / 100).toFixed(2)}`;

class Transactions extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = { items: null };
	}

	componentDidMount() {
		this.refreshData();
	}

	refreshData() {
		//A bit of a hack, we might not have set the current org ID yet for this admin so keep checking
		if (!user.currentOrganizationId) {
			this.timeout = setTimeout(this.refreshData.bind(this), 100);
			return;
		}

		//start_utc
		//end_utc
		Bigneon()
			.reports.transactionDetails({
				organization_id: user.currentOrganizationId,
				event_id: this.eventId
			})
			.then(response => {
				let items = [];

				response.data.forEach(item => {
					const transaction_date = moment(transaction_date).format(
						"MM/DD/YYYY hh:MM:A"
					);
					items.push({ ...item, transaction_date });
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

	renderList() {
		const { items, activeIndex } = this.state;

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
				<TransactionRow heading>{ths}</TransactionRow>

				{items.map((item, index) => {
					//	console.log(item);

					const {
						client_fee_in_cents,
						company_fee_in_cents,
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
						unit_price_in_cents,
						dollars(gross),
						dollars(company_fee_in_cents),
						dollars(client_fee_in_cents)
					];

					return (
						<TransactionRow
							key={index}
							onClick={() => this.setState({ activeIndex: index })}
							active={false}
							gray={!(index % 2)}
							active={activeIndex === index}
						>
							{tds}
						</TransactionRow>
					);
				})}
			</div>
		);
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
		const { showHoldDialog } = this.state;
		const { classes } = this.props;

		return (
			<Container eventId={this.eventId} subheading={"reports"}>
				{showHoldDialog && this.renderDialog()}
				<div style={{ display: "flex" }}>
					<Typography variant="title">Transaction report</Typography>
					<span style={{ flex: 1 }} />
					{/* <Button
						onClick={e => notifications.show({ message: "Coming soon." })}
					>
						Export as CSV
					</Button> */}
				</div>

				<Divider style={{ marginBottom: 40 }} />

				{this.renderList()}
				{this.renderDialog()}
			</Container>
		);
	}
}

export default withStyles(styles)(Transactions);
