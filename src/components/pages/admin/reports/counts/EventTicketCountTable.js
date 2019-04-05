import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import TicketCountRow from "./TicketCountRow";
import { dollars } from "../../../../../helpers/money";

const styles = theme => {
	return {
		root: {}
	};
};

const EventTicketCountTable = props => {
	const { ticketCounts, classes, hideDetails } = props;
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
						{
							!hideDetails ?

								sales.map((row, salesIndex) => {

									const {
										ticket_pricing_id,
										ticket_pricing_name,
										online_sale_count,
										box_office_sale_count,
										total_sold_count,
										comp_sale_count,
										total_sold_in_cents,
										promo_code_discounted_ticket_price,
										promo_redemption_code,
										hold_name
									} = row;
									let rowName = ticket_pricing_name;
									if (hold_name) {
										rowName = (promo_redemption_code ? "Promo - " : "Hold - ") + hold_name;
									}
									return (
										<TicketCountRow key={`${salesIndex}-${ticket_pricing_id}`}>
											{[
												rowName,
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
								})

								: null
						}

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
	classes: PropTypes.object.isRequired,
	hideDetails: PropTypes.bool
};

export default withStyles(styles)(EventTicketCountTable);
