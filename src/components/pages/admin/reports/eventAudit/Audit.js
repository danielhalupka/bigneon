import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import Divider from "../../../../common/Divider";
import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import { EventSalesTable, EVENT_SALES_HEADINGS } from "../eventSummary/EventSalesTable";
import { eventSalesCSVRows, eventSummaryData } from "../eventSummary/EventSummary";
import EventTicketCountTable from "../counts/EventTicketCountTable";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ticketCountReport from "../../../../../stores/reports/ticketCountReport";
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
		ticketCountReport.fetchCountAndSalesData(countQueryParams);
	}

	exportCSV() {
		const {
			eventSales,
			salesTotals
		} = this.state;
		const { eventId } = this.props;

		const { countsAndSalesByEventId } = ticketCountReport;
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

		const ticketCounts = ticketCountReport.countsAndSalesByTicketPricing(countsAndSalesByEventId[eventId]);
		const ticketCountRows = ticketCountReport.csv(ticketCounts);
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
			return <Loader/>;
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
		const { eventId, classes } = this.props;

		const { countsAndSalesByEventId } = ticketCountReport;
		if (!countsAndSalesByEventId) {
			return <Typography>No counts...</Typography>;
		}
		const ticketCounts = ticketCountReport.countsAndSalesByTicketPricing(countsAndSalesByEventId[eventId] || {});
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
