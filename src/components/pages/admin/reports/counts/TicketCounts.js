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

export const ticketCountData = (queryParams, onSuccess, onError) => {
	Bigneon()
		.reports.ticketCount(queryParams)
		.then(response => {
			onSuccess(response.data);
		})
		.catch(error => {
			onError(error);
		});
};

export const reportDataByEvent = (eventCounts) => {
	const result = {};
	eventCounts.forEach(row => {
		if (!result.hasOwnProperty(row.event_id)) {
			result[row.event_id] = [];
		}
		result[row.event_id].push(row);
	});
	return result;
};

export const buildRowAndTotalData = (eventData) => {
	const result = {
		rows: [],
		totals: {
			totalAllocation: 0,
			totalSoldOnlineCount: 0,
			totalBoxOfficeCount: 0,
			totalSoldCount: 0,
			totalCompsCount: 0,
			totalHoldsCount: 0,
			totalOpenCount: 0,
			totalReservedCount: 0,
			totalGross: 0
		}
	};

	eventData.forEach(dataRow => {
		const {
			ticket_type_id,
			ticket_name,
			allocation_count,
			unallocated_count,
			reserved_count,
			comp_available_count,
			hold_available_count,
			box_office_sale_count,
			online_sale_count,
			comp_sale_count,
			online_sales_in_cents = 0,
			box_office_sales_in_cents = 0
		} = dataRow;
		const total_held_tickets = comp_available_count + hold_available_count;
		const total_sold_count = online_sale_count + box_office_sale_count;
		const total_sold_in_cents = online_sales_in_cents + box_office_sales_in_cents;

		result.totals.totalAllocation += allocation_count;
		result.totals.totalSoldOnlineCount += online_sale_count;
		result.totals.totalBoxOfficeCount += box_office_sale_count;
		result.totals.totalSoldCount += total_sold_count;
		result.totals.totalCompsCount += comp_sale_count;
		result.totals.totalHoldsCount += total_held_tickets;
		result.totals.totalOpenCount += unallocated_count;
		result.totals.totalReservedCount += reserved_count;
		result.totals.totalGross += total_sold_in_cents;

		const row = {
			ticket_type_id,
			ticket_name,
			allocation_count,
			reserved_count,
			unallocated_count,
			comp_available_count,
			hold_available_count,
			box_office_sale_count,
			online_sale_count,
			comp_sale_count,
			online_sales_in_cents,
			box_office_sales_in_cents,
			total_held_tickets,
			total_sold_count,
			total_sold_in_cents
		};

		result.rows.push(row);
	});

	return result;
};

export const ticketCountCSVRows = (ticketCounts) => {
	const csvRows = [];
	const {
		totalAllocation = 0,
		totalSoldOnlineCount = 0,
		totalBoxOfficeCount = 0,
		totalSoldCount = 0,
		totalCompsCount = 0,
		totalHoldsCount = 0,
		totalOpenCount = 0,
		totalReservedCount,
		totalGross = 0
	} = ticketCounts.totals || {};

	csvRows.push([
		"Ticket",
		"Allocation",
		"QTY Sold Online",
		"QTY Sold BO",
		"Total sold",
		"Comps",
		"Holds",
		"In Cart",
		"Open",
		"Gross"
	]);

	ticketCounts.rows.forEach((row, index) => {
		const {
			ticket_name,
			allocation_count,
			unallocated_count,
			box_office_sale_count,
			online_sale_count,
			comp_sale_count,
			reserved_count,
			total_held_tickets,
			total_sold_in_cents,
			total_sold_count
		} = row;

		csvRows.push([
			ticket_name,
			allocation_count,
			online_sale_count,
			box_office_sale_count,
			total_sold_count,
			comp_sale_count,
			total_held_tickets,
			reserved_count,
			unallocated_count,
			dollars(total_sold_in_cents)
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
		totalReservedCount,
		totalOpenCount,
		dollars(totalGross)
	]);

	return csvRows;
};

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
		const reportData = reportDataByEvent(eventCounts);
		const ticketCounts = buildRowAndTotalData(reportData[eventId]);
		const eventName = (ticketCounts.rows.length && ticketCounts.rows[0].event_name) || "Unknown Event";

		let csvRows = [];

		csvRows.push(["Ticket counts report"]);
		csvRows.push([eventName]);
		csvRows.push([""]);

		const ticketCountRows = ticketCountCSVRows(ticketCounts);
		csvRows = [...csvRows, ...ticketCountRows];

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

		ticketCountData(
			queryParams,
			(data) => {
				const eventCounts = data.filter(row => row.organization_id === organizationId);
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

		const reportData = reportDataByEvent(eventCounts);

		const reportEventIds = Object.keys(reportData);

		if (reportEventIds.length === 0) {
			return <Typography>No events found.</Typography>;
		}

		//If we're showing a report for a specific event, only display the one result
		if (eventId) {
			const ticketCounts = buildRowAndTotalData(reportData[eventId]);
			return (
				<div>
					<EventTicketCountTable ticketCounts={ticketCounts}/>
				</div>
			);
		}

		return (
			<div>
				{Object.keys(reportData).map((reportEventId, index) => {
					const ticketCounts = buildRowAndTotalData(reportData[reportEventId]);
					const eventName = (reportData[reportEventId] && reportData[reportEventId][0].event_name) || "No Data";

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
