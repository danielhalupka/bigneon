import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";

import Divider from "../../../../common/Divider";
import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import { EventSalesTable, EVENT_SALES_HEADINGS } from "../eventSummary/EventSalesTable";
import { eventSalesCSVRows, eventSummaryData } from "../eventSummary/EventSummary";
import { ticketCountCSVRows, ticketCountData, reportDataByEvent, buildRowAndTotalData } from "../counts/TicketCounts";
import EventTicketCountTable from "../counts/EventTicketCountTable";
import downloadCSV from "../../../../../helpers/downloadCSV";

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

const styles = theme => ({
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

class Audit extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventSales: null,
			salesTotals: null,
			eventCounts: null
		};
	}

	componentDidMount() {
		this.refreshData();
	}

	refreshData() {
		const { eventId, organizationId } = this.props;

		const summaryQueryParams = { organization_id: organizationId, event_id: eventId };
		const countQueryParams = { ...summaryQueryParams }; //Cloning this because bn-api-node removes organization_id after user

		//TODO date filter
		//start_utc
		//end_utc

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

		//Refresh ticket counts
		ticketCountData(
			countQueryParams,
			(data) => {
				const eventCounts = data.filter(row => row.organization_id === organizationId) || [];
				this.setState({ eventCounts });

			}, error => {
				console.error(error);
				this.setState({ eventCounts: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event ticket count report failed."
				});
			});
	}

	exportCSV() {
		const {
			eventSales,
			salesTotals,
			eventCounts
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

		let title = "Event audit report";
		if (eventName) {
			title = `${title} - ${eventName}`;
		}

		csvRows.push([title]);
		csvRows.push([""]);

		//Sales details:

		csvRows.push(["All event sales"]);

		const eventSalesRows = eventSalesCSVRows(eventSales, salesTotals);
		csvRows = [...csvRows, ...eventSalesRows];

		csvRows.push([""]);
		csvRows.push([""]);

		csvRows.push(["Ticket counts"]);
		const eventCountsByEvent = reportDataByEvent(eventCounts);
		const ticketCounts = buildRowAndTotalData(eventCountsByEvent[eventId]);
		const ticketCountRows = ticketCountCSVRows(ticketCounts);
		csvRows = [...csvRows, ...ticketCountRows];

		downloadCSV(csvRows, "event-audit-report");
	}

	renderEventSales() {
		const { eventSales, salesTotals } = this.state;

		if (eventSales === false) {
			//Query failed
			return null;
		}

		if (eventSales === null) {
			return <Typography>Loading...</Typography>;
		}

		if (eventSales.length === 0) {
			return <Typography>No event summary available.</Typography>;
		}

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>All event sales</Typography>
				<EventSalesTable eventSales={eventSales} salesTotals={salesTotals}/>
			</div>
		);

	}

	renderTicketCounts() {
		const { eventCounts } = this.state;
		const { eventId, classes } = this.props;

		if (!eventCounts) {
			return <Typography>No counts...</Typography>;
		}

		const eventCountsByEvent = reportDataByEvent(eventCounts);
		const ticketCounts = buildRowAndTotalData(eventCountsByEvent[eventId] || []);
		return (
			<div>
				<Typography className={classes.subHeading}>Ticket counts</Typography>
				<EventTicketCountTable ticketCounts={ticketCounts}/>
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
				<Divider style={{ marginBottom: 40 }}/>

				{this.renderEventSales()}

				<div style={{ marginBottom: 40 }}/>

				{this.renderTicketCounts()}
			</div>
		);
	}
}

Audit.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string.isRequired,
	eventName: PropTypes.string
};

export default withStyles(styles)(Audit);
