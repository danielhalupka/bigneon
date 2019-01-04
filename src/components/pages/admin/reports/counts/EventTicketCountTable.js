import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import TicketCountRow from "./TicketCountRow";

const styles = theme => {
	return {
		root: {}
	};
};

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

const EventTicketCountTable = props => {
	const { ticketCounts, classes } = props;

	const ticketIds = Object.keys(ticketCounts);

	let totalAllocation = 0;
	let totalSoldOnlineCount = 0;
	let totalBoxOfficeCount = 0;
	let totalSoldCount = 0;
	let totalCompsCount = 0;
	let totalHoldsCount = 0;
	let totalOpenCount = 0;
	let totalGross = 0;

	return (
		<div className={classes.root}>
			<TicketCountRow heading>
				{[
					"Ticket",
					"Allocation",
					"QTY Sold Online",
					"QTY Sold BO",
					"Total sold",
					"Comps",
					"Holds",
					"Open",
					"Gross"
				]}
			</TicketCountRow>

			{ticketIds.map((ticketId, index) => {
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
				totalSoldCount += allocation_count - available_count;
				totalCompsCount += comp_count;
				totalHoldsCount += hold_count;
				totalOpenCount += available_count;
				totalGross += online_sales_in_cents + box_office_sales_in_cents;

				return (
					<TicketCountRow key={ticketId} gray={!(index % 2)}>
						{[
							ticket_name,
							allocation_count,
							online_count,
							box_office_count,
							allocation_count - available_count,
							comp_count,
							hold_count,
							available_count,
							dollars(online_sales_in_cents + box_office_sales_in_cents)
						]}
					</TicketCountRow>
				);
			})}

			<TicketCountRow total>
				{[
					"Totals",
					totalAllocation,
					totalSoldOnlineCount,
					totalBoxOfficeCount,
					totalSoldCount,
					totalCompsCount,
					totalHoldsCount,
					totalOpenCount,
					dollars(totalGross)
				]}
			</TicketCountRow>
		</div>
	);
};

EventTicketCountTable.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EventTicketCountTable);
