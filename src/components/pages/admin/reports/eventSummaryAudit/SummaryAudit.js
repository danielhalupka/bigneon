import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";

import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../../config/theme";
import notifications from "../../../../../stores/notifications";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ReportsDate from "../ReportDate";
import { SummaryAuditTable, SUMMARY_AUDIT_HEADINGS } from "./SummaryAuditTable";
import Loader from "../../../../elements/loaders/Loader";
import { dollars } from "../../../../../helpers/money";
import Bigneon from "../../../../../helpers/bigneon";
import reportDateRangeHeading from "../../../../../helpers/reportDateRangeHeading";
import Card from "../../../../elements/Card";
import user from "../../../../../stores/user";
import { observer } from "mobx-react";

//Temp solution to group price points if they have the same name and price
//If the API performs this function in the future, this code can be removed
//Iterates through price points and merges number values for price points that have the same pricing_name and price_in_cents
const groupPricePointsByNameAndPrice = (data) => {
	Object.keys(data).forEach(ticket_type_id => {
		const ticketType = data[ticket_type_id];
		const { pricePoints } = ticketType;
		const mergedPricePoints = [];

		pricePoints.forEach(pricePoint => {
			let existingIndex = -1;
			mergedPricePoints.forEach((mergedPoint, index) => {
				if (mergedPoint.pricing_name === pricePoint.pricing_name && mergedPoint.price_in_cents === pricePoint.price_in_cents) {
					existingIndex = index;
				}
			});

			if (existingIndex < 0) {
				mergedPricePoints.push(pricePoint);
			} else {
				//Merge results
				Object.keys(pricePoint).forEach(pricePointKey => {
					const pricePointValue = pricePoint[pricePointKey];
					if (pricePointKey !== "price_in_cents" && !isNaN(pricePointValue)) {
						//Add it up
						mergedPricePoints[existingIndex][pricePointKey] = mergedPricePoints[existingIndex][pricePointKey] + pricePointValue;
					}
				});
			}
		});

		data[ticket_type_id].pricePoints = mergedPricePoints;
	});

	return data;
};

export const eventSummaryData = (queryParams, onSuccess, onError) => {
	Bigneon()
		.reports.eventSummary(queryParams)
		.then(response => {
			const { sales, ticket_fees, other_fees } = response.data;

			const eventSales = {};

			//Event summary totals
			const salesTotals = {
				totalOnlineCount: 0,
				totalBoxOfficeCount: 0,
				totalSoldCount: 0,
				totalCompCount: 0,
				totalSalesValueInCents: 0
			};

			//Group sales by ticket type
			sales.forEach(sale => {
				const { ticket_type_id } = sale;

				const total_face_value_in_cents =
					sale.total_gross_income_in_cents -
					sale.total_client_fee_in_cents -
					sale.total_company_fee_in_cents;

				if (!eventSales[ticket_type_id]) {
					eventSales[ticket_type_id] = {
						name: sale.ticket_name,
						pricePoints: [{ ...sale, total_face_value_in_cents }],
						totals: {
							online_count: sale.online_count,
							box_office_count: sale.box_office_count,
							comp_count: sale.comp_count,
							total_gross_income_in_cents: sale.total_gross_income_in_cents,
							total_face_value_in_cents,
							total_sold: sale.total_sold
						}
					};
				} else {
					const { totals } = eventSales[ticket_type_id];
					totals.online_count += sale.online_count;
					totals.box_office_count += sale.box_office_count;
					totals.total_sold += sale.total_sold;
					totals.comp_count += sale.comp_count;
					totals.total_gross_income_in_cents +=
						sale.total_gross_income_in_cents;
					totals.total_face_value_in_cents += total_face_value_in_cents;

					eventSales[ticket_type_id].pricePoints.push({
						...sale,
						total_face_value_in_cents
					});
					eventSales[ticket_type_id].totals = totals;
				}

				salesTotals.totalOnlineCount += sale.online_count;
				salesTotals.totalBoxOfficeCount += sale.box_office_count;
				salesTotals.totalSoldCount += sale.total_sold;
				salesTotals.totalCompCount += sale.comp_count;
				salesTotals.totalSalesValueInCents += total_face_value_in_cents;
			});

			const revenueShare = {};
			const revenueTotals = {
				totalOnlineRevenue: 0,
				//Box office will go here
				totalRevenue: 0
			};

			ticket_fees.forEach(fee => {
				const { ticket_type_id } = fee;

				if (!revenueShare[ticket_type_id]) {
					revenueShare[ticket_type_id] = {
						name: fee.ticket_name,
						pricePoints: [fee],
						totals: {
							comp_count: fee.comp_count,
							company_fee_in_cents: fee.company_fee_in_cents,
							online_count: fee.online_count,
							total_client_fee_in_cents: fee.total_client_fee_in_cents,
							total_company_fee_in_cents: fee.total_company_fee_in_cents,
							total_sold: fee.total_sold
						}
					};
				} else {
					const { totals } = revenueShare[ticket_type_id];

					totals.comp_count += fee.comp_count;
					totals.company_fee_in_cents += fee.company_fee_in_cents;
					totals.online_count += fee.online_count;
					totals.total_client_fee_in_cents += fee.total_client_fee_in_cents;
					totals.total_company_fee_in_cents += fee.total_company_fee_in_cents;
					totals.total_sold += fee.total_sold;

					revenueShare[ticket_type_id].pricePoints.push(fee);
					revenueShare[ticket_type_id].totals = totals;
				}

				revenueTotals.totalOnlineRevenue += fee.total_client_fee_in_cents;
				revenueTotals.totalRevenue += fee.total_client_fee_in_cents;
			});

			let otherFees = other_fees[0];

			if (otherFees) {
				revenueTotals.totalOnlineRevenue +=
					otherFees.total_client_fee_in_cents;
				revenueTotals.totalRevenue += otherFees.total_client_fee_in_cents;
			} else {
				otherFees = { total_client_fee_in_cents: 0 };
			}

			onSuccess({
				eventSales: groupPricePointsByNameAndPrice(eventSales),
				revenueShare: groupPricePointsByNameAndPrice(revenueShare),
				salesTotals,
				revenueTotals,
				otherFees
			});
		})
		.catch(error => {
			onError(error);
		});
};

const summaryAuditCSVRows = (eventSales, salesTotals) => {
	const csvRows = [];
	csvRows.push(SUMMARY_AUDIT_HEADINGS);

	Object.keys(eventSales).forEach(ticketId => {
		const ticketSale = eventSales[ticketId];
		const { name, pricePoints, totals } = ticketSale;

		const {
			online_count,
			box_office_count,
			comp_count,
			total_sold,
			total_face_value_in_cents
		} = totals;

		csvRows.push([
			name,
			" ",
			online_count,
			box_office_count,
			total_sold,
			comp_count,
			dollars(total_face_value_in_cents)
		]);

		pricePoints.forEach(pricePoint => {
			csvRows.push([
				pricePoint.pricing_name,
				dollars(pricePoint.price_in_cents),
				pricePoint.online_count,
				pricePoint.box_office_count,
				pricePoint.total_sold,
				pricePoint.comp_count,
				dollars(pricePoint.total_face_value_in_cents)
			]);
		});
	});

	const {
		totalOnlineCount,
		totalBoxOfficeCount,
		totalSoldCount,
		totalCompCount,
		totalSalesValueInCents
	} = salesTotals;

	csvRows.push([
		"Total sales",
		" ",
		totalOnlineCount,
		totalBoxOfficeCount,
		totalSoldCount,
		totalCompCount,
		dollars(totalSalesValueInCents)
	]);

	return csvRows;
};

const styles = theme => ({
	root: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit
	},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

@observer
class SummaryAudit extends Component {
	constructor(props) {
		super(props);

		this.initialState = {
			eventSales: null,
			salesTotals: null,
			todayEventSales: null,
			todaySalesTotals: null,
			isLoading: false
		};

		this.state = this.initialState;
	}

	componentDidMount() {
		const { printVersion } = this.props;
		if (printVersion) {
			this.refreshData();
		}
	}

	refreshData(dataParams = { start_utc: null, end_utc: null, startDate: null, endDate: null }) {
		const { startDate, endDate, start_utc, end_utc } = dataParams;

		this.setState({ ...this.initialState, startDate, endDate, isLoading: true });

		const { eventId, organizationId } = this.props;
		const summaryQueryParams = { organization_id: organizationId, event_id: eventId, start_utc, end_utc };

		//Refresh event summary
		eventSummaryData(
			summaryQueryParams,
			({ eventSales, salesTotals }) => {
				this.setState({ eventSales, salesTotals, isLoading: false });
			},
			(error) => {
				console.error(error);
				this.setState({ eventSales: false, isLoading: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event transaction report failed."
				});
			});

		//Refresh today's summary
		const yesterday_utc = moment
			.utc()
			.tz(user.currentOrgTimezone)
			.startOf("day")
			//.subtract(1, "days")
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		const today_utc = moment
			.utc()
			.tz(user.currentOrgTimezone)
			.endOf("day")
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		const todayQueryParams = {
			organization_id: organizationId,
			event_id: eventId,
			start_utc: yesterday_utc,
			end_utc: today_utc
		};
		eventSummaryData(
			todayQueryParams,
			({ eventSales, salesTotals }) => {
				this.setState({ todayEventSales: eventSales, todaySalesTotals: salesTotals }, () => {
					const { onLoad } = this.props;
					onLoad ? onLoad() : null;
				});
			},
			(error) => {
				console.error(error);

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading today's event transaction report failed."
				});
			});

	}

	exportCSV() {
		const {
			eventSales,
			salesTotals,
			todayEventSales,
			todaySalesTotals,
			startDate,
			endDate
		} = this.state;
		const { eventId } = this.props;

		if (!eventSales) {
			return notifications.show({
				message: "No rows to export.",
				variant: "warning"
			});
		}

		const { eventName } = this.props;

		let csvRows = [];

		let title = "Summary audit report";
		if (eventName) {
			title = `${title} - ${eventName}`;
		}

		csvRows.push([title]);
		csvRows.push([`Transactions occurring ${reportDateRangeHeading(startDate, endDate)}`]);

		csvRows.push([""]);
		csvRows.push([""]);

		//Today's sales:
		csvRows.push(["Today's Sales"]);
		const todayRows = summaryAuditCSVRows(todayEventSales, todaySalesTotals);
		csvRows = [...csvRows, ...todayRows];

		csvRows.push([""]);
		csvRows.push([""]);

		//Date range sales:
		csvRows.push([`Sales occurring ${reportDateRangeHeading(startDate, endDate)}`]);
		const dateRangeRows = summaryAuditCSVRows(eventSales, salesTotals);
		csvRows = [...csvRows, ...dateRangeRows];

		downloadCSV(csvRows, "event-summary-audit-report");
	}

	renderTodayEventSales() {
		const { todayEventSales, todaySalesTotals } = this.state;

		if (!todayEventSales) {
			//Query failed
			return null;
		}

		if (todayEventSales.length === 0) {
			return <Typography>No summary audit for today available.</Typography>;
		}

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>Today's sales</Typography>
				<SummaryAuditTable eventSales={todayEventSales} salesTotals={todaySalesTotals}/>
			</div>
		);
	}

	renderDateRangeEventSales() {
		const { eventSales, salesTotals, startDate, endDate } = this.state;

		if (!eventSales) {
			//Query failed
			return null;
		}

		if (eventSales.length === 0) {
			return <Typography>No summary audit report available.</Typography>;
		}

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>Sales
					occurring {reportDateRangeHeading(startDate, endDate)}</Typography>
				<SummaryAuditTable eventSales={eventSales} salesTotals={salesTotals}/>
			</div>
		);
	}

	render() {
		const { printVersion, classes } = this.props;

		if (printVersion) {
			return (
				<div>
					{this.renderTodayEventSales()}
					<br/><br/>
					{this.renderDateRangeEventSales()}
				</div>
			);
		}

		const { currentOrgTimezone } = user;
		const { isLoading } = this.state;

		return (
			<Card variant={"block"}>
				<div className={classes.root}>
					<div
						style={{
							display: "flex",
							minHeight: 60,
							alignItems: "center"
						}}
					>
						<Typography variant="title">Event summary audit report</Typography>
						<span style={{ flex: 1 }}/>
						<Button
							iconUrl="/icons/csv-active.svg"
							variant="text"
							onClick={this.exportCSV.bind(this)}
						>
						Export CSV
						</Button>
						<Button
							href={`/exports/reports/?type=summary_audit&event_id=${this.props.eventId}`}
							target={"_blank"}
							iconUrl="/icons/pdf-active.svg"
							variant="text"
						>
						Export PDF
						</Button>
					</div>

					{currentOrgTimezone ? (
						<ReportsDate
							timezone={currentOrgTimezone}
							onChange={this.refreshData.bind(this)}
							onChangeButton
						/>
					) : null }

					{isLoading ? <Loader/> : (
						<div>
							{this.renderTodayEventSales()}

							<div style={{ marginTop: 40 }}/>

							{this.renderDateRangeEventSales()}

						</div>
					)}

					<div style={{ marginBottom: 40 }}/>
				</div>
			</Card>
		);
	}
}

SummaryAudit.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string.isRequired,
	eventName: PropTypes.string,
	printVersion: PropTypes.bool,
	onLoad: PropTypes.func
};

export default withStyles(styles)(SummaryAudit);
