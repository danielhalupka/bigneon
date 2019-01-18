import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";
import PropTypes from "prop-types";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import Divider from "../../../../common/Divider";
import Button from "../../../../elements/Button";
import downloadCSV from "../../../../../helpers/downloadCSV";
import EventTicketCountTable from "./EventTicketCountTable";
import { fontFamilyDemiBold, secondaryHex } from "../../../../styles/theme";

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

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

class TicketCounts extends Component {
	constructor(props) {
		super(props);

		this.state = { eventCounts: null };
	}

	componentDidMount() {
		this.refreshData();
	}

	exportCSV(eventId) {
		const { eventCounts } = this.state;

		if (!eventCounts) {
			return notifications.show({
				message: "No data to export."
			});
		}
		const ticketCounts = eventCounts[eventId];

		const ticketIds = Object.keys(ticketCounts);

		const eventName = ticketCounts[ticketIds[0]].totals.event_name;

		const csvRows = [];

		csvRows.push(["Ticket counts report"]);
		csvRows.push([eventName]);
		csvRows.push([""]);

		let totalAllocation = 0;
		let totalSoldOnlineCount = 0;
		let totalBoxOfficeCount = 0;
		let totalSoldCount = 0;
		let totalCompsCount = 0;
		let totalHoldsCount = 0;
		let totalOpenCount = 0;
		let totalGross = 0;

		csvRows.push([
			"Ticket",
			"Allocation",
			"QTY Sold Online",
			"QTY Sold BO",
			"Total sold",
			"Comps",
			"Holds",
			"Open",
			"Gross"
		]);

		ticketIds.forEach((ticketId, index) => {
			const { sales, totals } = ticketCounts[ticketId];

			const {
				ticket_name,
				allocation_count,
				available_count,
				comp_count,
				hold_count
			} = totals;

			const {
				box_office_count = 0,
				online_count = 0,
				online_sales_in_cents = 0,
				box_office_sales_in_cents = 0
			} = sales || {};

			totalAllocation += allocation_count;
			totalSoldOnlineCount += online_count;
			totalBoxOfficeCount += box_office_count;
			totalSoldCount += online_count + box_office_count;
			totalCompsCount += comp_count;
			totalHoldsCount += hold_count;
			totalOpenCount += available_count;
			totalGross += online_sales_in_cents + box_office_sales_in_cents;

			csvRows.push([
				ticket_name,
				allocation_count,
				online_count,
				box_office_count,
				online_count + box_office_count,
				comp_count,
				hold_count,
				available_count,
				dollars(online_sales_in_cents + box_office_sales_in_cents)
			]);
		});

		csvRows.push([
			"Totals",
			totalAllocation,
			totalSoldOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompsCount,
			totalHoldsCount,
			totalOpenCount,
			dollars(totalGross)
		]);

		downloadCSV(csvRows, "ticket-counts-report");
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

		Bigneon()
			.reports.ticketCount(queryParams)
			.then(response => {
				const eventCounts = response.data[organizationId] || {};

				this.setState({ eventCounts });
			})
			.catch(error => {
				console.error(error);
				this.setState({ eventCounts: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event ticket count report failed."
				});
			});
	}

	renderList() {
		const { eventId, classes } = this.props;
		const { eventCounts } = this.state;

		if (eventCounts === false) {
			//Query failed
			return null;
		}

		if (eventCounts === null) {
			return <Typography>Loading...</Typography>;
		}

		const reportEventIds = Object.keys(eventCounts);

		if (reportEventIds.length === 0) {
			return <Typography>No events found.</Typography>;
		}

		//If we're showing a report for a specific event, only display the one result
		if (eventId) {
			const ticketCounts = eventCounts[eventId];
			return (
				<div>
					<EventTicketCountTable ticketCounts={ticketCounts}/>
				</div>
			);
		}

		return (
			<div>
				{Object.keys(eventCounts).map((reportEventId, index) => {
					const ticketCounts = eventCounts[reportEventId];
					const ticketIds = Object.keys(ticketCounts);
					const eventName = ticketCounts[ticketIds[0]].totals.event_name;

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
				})}
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
