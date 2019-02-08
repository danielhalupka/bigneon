import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import notifications from "../../../../../stores/notifications";
import Divider from "../../../../common/Divider";
import Button from "../../../../elements/Button";
import downloadCSV from "../../../../../helpers/downloadCSV";
import EventSummaryRow from "./EventSummaryRow";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import { EventSalesTable, EVENT_SALES_HEADINGS } from "./EventSalesTable";
import Loader from "../../../../elements/loaders/Loader";
import summaryReport from "../../../../../stores/reports/summaryReport";
import { observer } from "mobx-react";
import { dollars } from "../../../../../helpers/money";

const styles = theme => ({
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

export const REVENUE_SHARE_HEADINGS = [
	"Ticket",
	"Price",
	"Online rev share",
	"Online",
	" ", //"Box office rev share",
	" ", //"Box office",
	"Total value"
];

@observer
class EventSummary extends Component {
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
		summaryReport.fetchCountAndSalesData(queryParams);
	}

	exportCSV() {
		const { eventId } = this.props;
		downloadCSV(summaryReport.csv(summaryReport.dataByPrice[eventId]), "event-summary-report");
	}

	renderEventSales() {
		const { eventId } = this.props;
		const eventSales = summaryReport.dataByPrice[eventId];

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

	renderRevenueShare() {
		const { eventId, classes } = this.props;
		const eventSales = summaryReport.dataByPrice[eventId];

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
		const {
			totalOnlineClientFeesInCents
		} = eventSales.totals;

		return (
			<div>
				<Typography className={classes.subHeading}>Revenue share</Typography>

				<EventSummaryRow heading>{REVENUE_SHARE_HEADINGS}</EventSummaryRow>

				{Object.keys(eventSales.tickets).map((ticketId, index) => {
					const ticketSale = eventSales.tickets[ticketId];
					const { totals, sales, name } = ticketSale;

					const {
						totalSoldOnlineCount,
						totalOnlineClientFeesInCents
					} = totals;

					return (
						<div key={ticketId}>
							<EventSummaryRow ticketTypeRow gray>
								{[
									name,
									" ",
									dollars(totalOnlineClientFeesInCents),
									totalSoldOnlineCount,
									" ",
									" ",
									dollars(totalOnlineClientFeesInCents)
								]}
							</EventSummaryRow>

							{sales.map((pricePoint, priceIndex) => (
								<EventSummaryRow key={priceIndex}>
									{[
										pricePoint.ticket_pricing_name,
										dollars(pricePoint.ticket_pricing_price_in_cents),
										dollars(pricePoint.client_online_fees_in_cents),
										pricePoint.online_sale_count,
										" ",
										" ",
										dollars(pricePoint.client_online_fees_in_cents)
									]}
								</EventSummaryRow>
							))}
						</div>
					);
				})}

				<EventSummaryRow ticketTypeRow total>
					{[
						"Total revenue share",
						" ",
						dollars(totalOnlineClientFeesInCents),
						" ",
						" ",
						" ",
						dollars(totalOnlineClientFeesInCents)
					]}
				</EventSummaryRow>
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
					<Typography variant="title">Event summary report</Typography>
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

				<br/>
				<br/>

				{this.renderRevenueShare()}
			</div>
		);
	}
}

EventSummary.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string.isRequired,
	eventName: PropTypes.string
};

export const EventSummaryReport = withStyles(styles)(EventSummary);
