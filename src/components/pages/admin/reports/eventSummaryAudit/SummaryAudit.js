import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment";

import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import { eventSummaryData } from "../eventSummary/EventSummary";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ReportsDate from "../ReportDate";
import { SummaryAuditTable, SUMMARY_AUDIT_HEADINGS } from "./SummaryAuditTable";
import Loader from "../../../../elements/loaders/Loader";

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

const dateRangeString = (startDate, endDate) => (startDate && endDate) ? `from ${startDate.format("MMM DD, YYYY")} - ${endDate.format("MMM DD, YYYY")}` : "from all time";

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
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

class SummaryAudit extends Component {
	constructor(props) {
		super(props);

		this.initialState = {
			eventSales: null,
			salesTotals: null,
			todayEventSales: null,
			todaySalesTotals: null
		};

		this.state = this.initialState;
	}

	refreshData(dataParams = { start_utc: null, end_utc: null, startDate: null, endDate: null }) {
		const { startDate, endDate, start_utc, end_utc } = dataParams;

		this.setState({ ...this.initialState, startDate, endDate });

		const { eventId, organizationId } = this.props;
		const summaryQueryParams = { organization_id: organizationId, event_id: eventId, start_utc, end_utc };

		//Refresh event summary
		eventSummaryData(
			summaryQueryParams,
			({ eventSales, salesTotals }) => {
				this.setState({ eventSales, salesTotals });
			},
			(error) => {
				console.error(error);
				this.setState({ eventSales: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event transaction report failed."
				});
			});

		//Refresh today's summary
		const yesterday_utc = moment
			.utc()
			.startOf("day")
			//.subtract(1, "days")
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		const today_utc = moment
			.utc()
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		const todayQueryParams = { organization_id: organizationId, event_id: eventId, start_utc: yesterday_utc, end_utc: today_utc };
		eventSummaryData(
			todayQueryParams,
			({ eventSales, salesTotals }) => {
				this.setState({ todayEventSales: eventSales, todaySalesTotals: salesTotals });
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
		const { eventId }  = this.props;

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
		csvRows.push([`Transactions occurring ${dateRangeString(startDate, endDate)}`]);

		csvRows.push([""]);
		csvRows.push([""]);

		//Today's sales:
		csvRows.push(["Today's Sales"]);
		const todayRows  = summaryAuditCSVRows(todayEventSales, todaySalesTotals);
		csvRows = [...csvRows, ...todayRows];

		csvRows.push([""]);
		csvRows.push([""]);

		//Date range sales:
		csvRows.push([`Sales occurring ${dateRangeString(startDate, endDate)}`]);
		const dateRangeRows  = summaryAuditCSVRows(eventSales, salesTotals);
		csvRows = [...csvRows, ...dateRangeRows];

		downloadCSV(csvRows, "event-summary-audit-report");
	}

	renderTodayEventSales() {
		const { todayEventSales, todaySalesTotals } = this.state;

		if (todayEventSales === false) {
			//Query failed
			return null;
		}

		if (todayEventSales === null) {
			return <Loader/>;
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

		if (eventSales === false) {
			//Query failed
			return null;
		}

		if (eventSales === null) {
			return <Loader/>;
		}

		if (eventSales.length === 0) {
			return <Typography>No summary audit report available.</Typography>;
		}

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>Sales occurring {dateRangeString(startDate, endDate)}</Typography>
				<SummaryAuditTable eventSales={eventSales} salesTotals={salesTotals}/>
			</div>
		);
	}

	render() {
		return (
			<div>
				<div
					style={{
						display: "flex",
						minHeight: 60,
						alignItems: "center"
					}}
				>
					<Typography variant="title">Event audit report</Typography>
					<span style={{ flex: 1 }}/>
					<Button
						iconUrl="/icons/csv-active.svg"
						variant="text"
						onClick={this.exportCSV.bind(this)}
					>
						Export CSV
					</Button>
				</div>
				<ReportsDate onChange={this.refreshData.bind(this)}/>

				{this.renderTodayEventSales()}

				<div style={{ marginTop: 40 }}/>

				{this.renderDateRangeEventSales()}

				<div style={{ marginBottom: 40 }}/>
			</div>
		);
	}
}

SummaryAudit.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string.isRequired,
	eventName: PropTypes.string
};

export default withStyles(styles)(SummaryAudit);
