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

const styles = theme => ({
	root: {},
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

		const { eventId, organizationId } = this.props;

		let queryParams = { organization_id: organizationId };

		if (eventId) {
			queryParams = { ...queryParams, event_id: eventId };
		}
		ticketCountReport.fetchCountAndSalesData(queryParams);

	}

	renderList() {
		const { eventId, classes } = this.props;
		const eventDataResults = ticketCountReport.dataByPrice;
		if (eventDataResults === null) {
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
		const { eventId, classes } = this.props;

		return (
			<div>
				<div className={classes.header}>
					<Typography variant="title">
						{eventId ? "Event" : "Organization"} ticket counts report
					</Typography>
					<span style={{ flex: 1 }}/>
					{eventId ? (
						<Button
							iconUrl="/icons/csv-active.svg"
							variant="text"
							onClick={() => this.exportCSV(eventId)}
						>
							Export CSV
						</Button>
					) : null}
				</div>
				<Divider style={{ marginBottom: 40 }}/>
				{this.renderList()}
			</div>
		);
	}
}

TicketCounts.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string,
	eventName: PropTypes.string
};

export default withStyles(styles)(TicketCounts);
