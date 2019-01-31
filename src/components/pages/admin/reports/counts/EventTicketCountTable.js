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
					"In Cart",
					"Open",
					"Gross"
				]}
			</TicketCountRow>

			{ticketCounts.rows.map((row, index) => {
				const ticketId = row.ticket_type_id;

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

				return (
					<TicketCountRow key={ticketId} gray={!(index % 2)}>
						{[
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
					totalReservedCount,
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
