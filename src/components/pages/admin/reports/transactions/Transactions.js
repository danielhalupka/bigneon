import React, { Component } from "react";
import { Grid, Typography, withStyles } from "@material-ui/core";
import moment from "moment-timezone";
import PropTypes from "prop-types";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import TransactionRow from "./TransactionRow";
import TransactionDialog from "./TransactionDialog";
import Button from "../../../../elements/Button";
import downloadCSV from "../../../../../helpers/downloadCSV";
import Loader from "../../../../elements/loaders/Loader";
import { dollars } from "../../../../../helpers/money";
import ReportsDate from "../ReportDate";
import reportDateRangeHeading from "../../../../../helpers/reportDateRangeHeading";
import BoxInput from "../../../../elements/form/BoxInput";
import boxOffice from "../../../../../stores/boxOffice";
import Card from "../../../../elements/Card";
import { Pagination, urlPageParam } from "../../../../elements/Pagination";
import InputWithButton from "../../../../common/form/InputWithButton";
import user from "../../../../../stores/user";
import { observer } from "mobx-react";

const styles = theme => ({
	root: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit
	},
	header: {
		display: "flex",
		minHeight: 60,
		alignItems: "center"
	},
	exportButtonContainer: {
		display: "flex",
		justifyContent: "flex-end"
	}
});

const LINE_LIMIT_PER_PAGE = 20;
const DEBOUNCE_DELAY = 500;

@observer
class Transactions extends Component {
	constructor(props) {
		super(props);

		this.state = {
			items: null,
			isLoading: false,
			paging: null,
			searchQuery: ""
		};

		this.currentDateParams = {};
	}

	componentDidMount() {
		const { printVersion } = this.props;
		if (printVersion) {
			this.refreshData();
		}
	}

	componentWillUnmount() {
		this.clearDebounceTimer();
	}

	exportCSV() {
		const { items, startDate, endDate } = this.state;

		if (!items || items.length < 1) {
			return notifications.show({
				message: "No rows to export.",
				variant: "warning"
			});
		}

		const { eventName, eventId } = this.props;

		const csvRows = [];

		let title = "Transaction details report";
		if (eventName) {
			title = `${title} - ${eventName}`;
		}

		csvRows.push([title]);
		csvRows.push([`Transactions occurring ${reportDateRangeHeading(startDate, endDate)}`]);
		csvRows.push([""]);

		csvRows.push([
			"Order ID",
			"Event",
			"Ticket type",
			"Order type",
			"Payment method",
			"Transaction date",
			"Redemption code",
			"Order type",
			"Payment method",
			"Quantity Sold",
			"Quantity Refunded",
			"Actual Quantity",
			"Unit price",
			"Face value",
			"Service fees",
			"Gross",
			"First Name",
			"Last Name",
			"Email"
		]);

		items.forEach(item => {
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
				refunded_quantity,
				redemption_code,
				ticket_name,
				formattedDate,
				unit_price_in_cents,
				user_id,
				gross_fee_in_cents_total,
				event_fee_gross_in_cents_total,
				first_name,
				last_name,
				email
			} = item;

			csvRows.push([
				order_id.slice(-8),
				event_name,
				ticket_name,
				order_type,
				payment_method,
				formattedDate,
				redemption_code,
				order_type,
				payment_method,
				quantity,
				refunded_quantity,
				quantity - refunded_quantity,
				dollars(unit_price_in_cents),
				dollars((quantity - refunded_quantity) * unit_price_in_cents), //Face value
				dollars(event_fee_gross_in_cents_total + gross_fee_in_cents_total),
				dollars(gross),
				first_name,
				last_name,
				email
			]);
		});

		downloadCSV(csvRows, "transaction-report");
	}

	clearDebounceTimer() {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
	}

	onSearch(e) {
		const searchQuery = e.target.value;
		this.setState({ searchQuery }, () => {
			const { startDate = null, endDate = null, start_utc = null, end_utc = null } = this.currentDateParams;

			this.clearDebounceTimer();
			this.debounceTimeout = setTimeout(() => this.refreshData({ start_utc, end_utc, startDate, endDate }, 0), DEBOUNCE_DELAY);
		});
	}

	changePage(page = urlPageParam()) {
		const { startDate = null, endDate = null, start_utc = null, end_utc = null } = this.currentDateParams;
		this.refreshData({ start_utc, end_utc, startDate, endDate }, page);
	}

	refreshData(dataParams = { start_utc: null, end_utc: null, startDate: null, endDate: null }, page = 0) {
		const { startDate, endDate, start_utc, end_utc } = dataParams;

		this.currentDateParams = dataParams;

		const { eventId, organizationId, onLoad } = this.props;
		const { searchQuery } = this.state;

		let queryParams = {
			organization_id: organizationId,
			start_utc,
			end_utc,
			page,
			limit: LINE_LIMIT_PER_PAGE,
			query: searchQuery
		};

		if (eventId) {
			queryParams = { ...queryParams, event_id: eventId };
		}

		this.setState({ startDate, endDate, items: null, isLoading: true });
		
		Bigneon()
			.reports.transactionDetails(queryParams)
			.then(response => {
				const { data, paging } = response.data;
				const items = [];
				data.forEach(item => {
					const formattedDate = moment
						.utc(item.transaction_date)
						.tz(user.currentOrgTimezone)
						.format("MM/DD/YYYY h:mm:A");
					items.push({ ...item, formattedDate });
				});

				items.sort((a, b) => {
					//Gte the dates we need to compare
					if (moment(a.transaction_date).diff(moment(b.transaction_date)) < 0) {
						return 1;
					} else {
						return -1;
					}
				});

				this.setState({ items, paging, isLoading: false }, () => {
					onLoad ? onLoad() : null;
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ items: null, isLoading: false });

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

	renderList() {
		const { items, hoverIndex, isLoading } = this.state;
		const { printVersion } = this.props;

		if (isLoading) {
			return <Loader/>;
		}

		if (items === null) {
			//Query failed
			return null;
		}

		if (items.length === 0) {
			return <Typography>No transactions found.</Typography>;
		}

		//If we're showing this on an org level then we need to show event names
		const includeEventName = !this.props.eventId;

		const ths = [
			"Order ID",
			"Name",
			"Email",
			"Date/time",
			"Qty",
			"Gross"
		];

		if (includeEventName) {
			ths.splice(1, 0, "Event");
		}

		return (
			<div>
				<TransactionRow heading>{ths}</TransactionRow>

				{items.map((item, index) => {
					const {
						event_name,
						gross,
						order_type,
						quantity,
						ticket_name,
						formattedDate,
						unit_price_in_cents,
						gross_fee_in_cents_total,
						event_fee_gross_in_cents_total,
						first_name,
						last_name,
						email,
						refunded_quantity,
						order_id
					} = item;

					const tds = [
						`#${order_id.slice(-8)}`,
						`${first_name} ${last_name}`,
						email,
						formattedDate,
						quantity - refunded_quantity,
						dollars(gross)
					];

					if (includeEventName) {
						tds.splice(1, 0, event_name);
					}

					return (
						<TransactionRow
							key={index}
							onClick={() => this.setState({ activeIndex: index })}
							onMouseEnter={() => this.setState({ hoverIndex: index })}
							onMouseLeave={() => this.setState({ hoverIndex: null })}
							active={false}
							gray={!(index % 2)}
							active={hoverIndex === index && !printVersion}
						>
							{tds}
						</TransactionRow>
					);
				})}
			</div>
		);
	}

	render() {
		const { eventId, classes, printVersion } = this.props;

		if (printVersion) {
			return this.renderList();
		}

		const { isLoading, paging, searchQuery } = this.state;

		const { currentOrgTimezone } = user;

		return (
			<Card variant={"block"}>
				<div className={classes.root}>
					<Grid className={classes.header} container>
						<Grid item xs={12} sm={12} md={4} lg={4}>
							<Typography variant="title">
								{eventId ? "Event" : "Organization"} transaction report
							</Typography>
						</Grid>
						<Grid item xs={12} sm={12} md={4} lg={4}>

							<BoxInput
								name="Search"
								value={searchQuery}
								placeholder="Search by guest name, email or event name"
								onChange={this.onSearch.bind(this)}
							/>
							{/*<InputWithButton*/}
							{/*// style={{ marginBottom: 20, marginTop: 20 }}*/}
							{/*name={"tx-report-search"}*/}
							{/*placeholder="Search by guest name, email or event name"*/}
							{/*buttonText="Search"*/}
							{/*onSubmit={this.onSearch.bind(this)}*/}
							{/*disabled={isLoading}*/}
							{/*/>*/}
						</Grid>

						<Grid item xs={12} sm={12} md={4} lg={4} className={classes.exportButtonContainer}>
							<Button
								iconUrl="/icons/csv-active.svg"
								variant="text"
								onClick={this.exportCSV.bind(this)}
							>
								Export CSV
							</Button>
							<Button
								href={`/exports/reports/?type=transactions${eventId ? `&event_id=${eventId}` : ""}`}
								target={"_blank"}
								iconUrl="/icons/pdf-active.svg"
								variant="text"
							>
								Export PDF
							</Button>
						</Grid>
					</Grid>

					{currentOrgTimezone ? (
						<ReportsDate
							timezone={currentOrgTimezone}
							onChange={this.refreshData.bind(this)}
							defaultStartTimeBeforeNow={{ value: 1, unit: "M" }}
							onChangeButton
						/>
					) : null }

					{this.renderDialog()}
					{this.renderList()}

					{paging ? <Pagination isLoading={isLoading} paging={paging} onChange={this.changePage.bind(this)}/> : null}
				</div>
			</Card>
		);
	}
}

Transactions.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string,
	eventName: PropTypes.string,
	printVersion: PropTypes.bool,
	onLoad: PropTypes.func
};

export default withStyles(styles)(Transactions);
