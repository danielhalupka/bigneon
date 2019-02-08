import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import Divider from "../../../../common/Divider";
import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import { EventSalesTable } from "../eventSummary/EventSalesTable";
import EventTicketCountTable from "../counts/EventTicketCountTable";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ticketCountReport from "../../../../../stores/reports/ticketCountReport";
import summaryReport from "../../../../../stores/reports/summaryReport";
import { observer } from "mobx-react";
import Loader from "../../../../elements/loaders/Loader";

const styles = theme => ({
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

@observer
class Audit extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		this.refreshData();
	}

	refreshData() {
		const { eventId, organizationId } = this.props;

		const queryParams = { organization_id: organizationId, event_id: eventId };

		//TODO date filter
		//start_utc
		//end_utc

		//Refresh ticket counts
		ticketCountReport.fetchCountAndSalesData(queryParams);
	}

	exportCSV() {
		const { eventId } = this.props;

		const { tickets = {} } = ticketCountReport.dataByTicketPricing[eventId];
		if (!Object.keys(tickets).length) {
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

		const eventSalesRows = summaryReport.salesCsvData(ticketCountReport.dataByPrice[eventId]);
		csvRows = [...csvRows, ...eventSalesRows];

		csvRows.push([""]);
		csvRows.push([""]);

		const ticketCountRows = ticketCountReport.csv(ticketCountReport.dataByTicketPricing[eventId]);
		csvRows = [...csvRows, ...ticketCountRows];

		downloadCSV(csvRows, "event-audit-report");
	}

	renderEventSales() {
		const { eventId } = this.props;
		const eventSales = ticketCountReport.dataByPrice[eventId];

		if (eventSales === false) {
			//Query failed
			return null;
		}

		if (eventSales === null || eventSales === undefined) {
			return <Loader/>;
		}

		if (Object.keys(eventSales.tickets).length === 0) {
			return <Typography>No event summary available.</Typography>;
		}

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>All event sales</Typography>
				<EventSalesTable eventSales={eventSales.tickets} salesTotals={eventSales.totals}/>
			</div>
		);

	}

	renderTicketCounts() {
		const { eventId, classes } = this.props;

		const eventData = ticketCountReport.dataByTicketPricing[eventId];
		if (!eventData) {
			return <Typography>No counts...</Typography>;
		}

		return (
			<div>
				<Typography className={classes.subHeading}>Ticket counts</Typography>
				<EventTicketCountTable ticketCounts={eventData}/>
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
