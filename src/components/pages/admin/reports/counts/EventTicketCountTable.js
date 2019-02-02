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

	const { tickets } = ticketCounts;
	const ticketTypeIds = Object.keys(tickets);
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

			{ticketTypeIds.map((ticketTypeId, index) => {
				const ticketData = tickets[ticketTypeId];
				const { totals, sales } = ticketData;
				const {
					totalAllocation,
					totalBoxOfficeCount,
					totalCompsCount,
					totalGross,
					totalHoldsCount,
					totalOpenCount,
					totalReservedCount,
					totalSoldCount,
					totalSoldOnlineCount
				} = totals;
				//Summary Row of counts
				const { name } = ticketData;
				return (
					<div key={index}>
						<TicketCountRow subHeading>
							{[
								name,
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
						{sales.map(row => {
							const {
								ticket_pricing_id,
								ticket_pricing_name,
								online_sale_count,
								box_office_sale_count,
								total_sold_count,
								comp_sale_count,
								total_sold_in_cents
							} = row;
							return (
								<TicketCountRow key={ticket_pricing_id}>
									{[
										ticket_pricing_name,
										" ",
										online_sale_count,
										box_office_sale_count,
										total_sold_count,
										comp_sale_count,
										" ",
										" ",
										" ",
										dollars(total_sold_in_cents)
									]}
								</TicketCountRow>
							);
						})}
					</div>
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
