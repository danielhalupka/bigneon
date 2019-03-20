import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";

import notifications from "../../../../../stores/notifications";
import Divider from "../../../../common/Divider";
import Button from "../../../../elements/Button";
import downloadCSV from "../../../../../helpers/downloadCSV";
import EventTicketCountTable from "./EventTicketCountTable";
import { fontFamilyDemiBold, secondaryHex } from "../../../../styles/theme";
import ticketCountReport from "../../../../../stores/reports/ticketCountReport";
import { observer } from "mobx-react";
import Loader from "../../../../elements/loaders/Loader";
import Card from "../../../../elements/Card";

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
	multiEventContainer: {
		marginBottom: theme.spacing.unit * 8
	},
	multiEventHeader: {
		display: "flex",
		justifyContent: "space-between"
	},
	multiEventTitle: {
		fontSize: theme.typography.fontSize * 1.4,
		fontFamily: fontFamilyDemiBold
	},
	eventNumber: {
		color: secondaryHex
	},
	subheading: {
		fontFamily: fontFamilyDemiBold,
		marginBottom: theme.spacing.unit
	}
});

@observer
class TicketCounts extends Component {
	constructor(props) {
		super(props);
		
		this.state = {};
	}

	componentDidMount() {
		this.refreshData();
	}

	componentWillUnmount() {
		ticketCountReport.setCountAndSalesData(); //Clears current results in memory
	}

	exportCSV(eventId) {
		const eventData = ticketCountReport.dataByPrice[eventId];
		if (!eventData) {
			return notifications.show({
				message: "No data to export."
			});
		}
		downloadCSV(ticketCountReport.csv(eventData), "ticket-counts-report");
	}

	refreshData() {
		//TODO date filter
		//start_utc
		//end_utc

		const { eventId, organizationId, onLoad } = this.props;

		let queryParams = { organization_id: organizationId };

		if (eventId) {
			queryParams = { ...queryParams, event_id: eventId };
		}
		ticketCountReport.fetchCountAndSalesData(queryParams, false, onLoad);
	}

	renderList() {
		const { eventId, classes } = this.props;
		const eventDataResults = ticketCountReport.dataByPrice;
		console.log(eventDataResults);
		if (eventDataResults === null || ticketCountReport.isLoading) {
			return <Loader/>;
		}

		const reportEventIds = Object.keys(eventDataResults);

		if (reportEventIds.length === 0) {
			return <Typography>No events found.</Typography>;
		}

		//If we're showing a report for a specific event, only display the one result
		if (eventId) {
			const ticketCounts = eventDataResults[eventId];
			return (
				<div>
					<EventTicketCountTable ticketCounts={ticketCounts}/>
				</div>
			);
		}

		return (
			<div>
				{
					Object.keys(eventDataResults).map((reportEventId, index) => {
						const ticketCounts = eventDataResults[reportEventId];
						const eventName = ticketCounts.eventName;
						return (
							<div key={reportEventId} className={classes.multiEventContainer}>
								<div className={classes.multiEventHeader}>
									<div>
										<Typography className={classes.multiEventTitle}>
											<span className={classes.eventNumber}>{index + 1}.</span>{" "}
											{eventName}
										</Typography>
									</div>
									<div>
										<Button
											iconUrl="/icons/csv-active.svg"
											variant="text"
											onClick={() => this.exportCSV(reportEventId)}
										>
											Export CSV
										</Button>
										<Button
											href={`/exports/reports/?type=ticket_counts&event_id=${reportEventId}`}
											target={"_blank"}
											iconUrl="/icons/pdf-active.svg"
											variant="text"
										>
											Export PDF
										</Button>
									</div>
								</div>

								<Typography className={classes.subheading}>Inventory</Typography>

								<EventTicketCountTable ticketCounts={ticketCounts}/>

								<Divider style={{ marginTop: 20, marginBottom: 20 }}/>
							</div>
						);
					})
				}
			</div>
		);
	}

	render() {
		const { eventId, classes, printVersion } = this.props;

		if (printVersion) {
			return this.renderList();
		}

		return (
			<Card variant={"block"}>
				<div className={classes.root}>
					<div className={classes.header}>
						<Typography variant="title">
							{eventId ? "Event" : "Organization"} ticket counts report
						</Typography>
						<span style={{ flex: 1 }}/>
						{eventId ? (
							<div>
								<Button
									iconUrl="/icons/csv-active.svg"
									variant="text"
									onClick={() => this.exportCSV(eventId)}
								>
							Export CSV
								</Button>
								<Button
									href={`/exports/reports/?type=ticket_counts&event_id=${eventId}`}
									target={"_blank"}
									iconUrl="/icons/pdf-active.svg"
									variant="text"
								>
								Export PDF
								</Button>
							</div>
						) : null}
					</div>
					<Divider style={{ marginBottom: 40 }}/>
					{this.renderList()}
				</div>
			</Card>
		);
	}
}

TicketCounts.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string,
	eventName: PropTypes.string,
	printVersion: PropTypes.bool,
	onLoad: PropTypes.func
};

export default withStyles(styles)(TicketCounts);
