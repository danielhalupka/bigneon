import React from "react";
import PropTypes from "prop-types";
import EventSettlementRow from "./EventSettlementRow";
import { dollars } from "../../../../../helpers/money";

const InventorySoldTable = props => {
	const { tickets, totals } = props;

	const ticketTypeIds = Object.keys(tickets);

	return (
		<div>
			<EventSettlementRow heading>
				{[
					"Ticket",
					"Price",
					"Online",
					"Box office",
					"Total sold",
					"Total comps",
					"Total owed"
				]}
			</EventSettlementRow>

			{ticketTypeIds.map((ticketTypeId, index) => {
				const ticketTypeData = tickets[ticketTypeId];

				const {
					name,
					sales,
					counts,
					totals
				} = ticketTypeData;

				const {
					totalAllocation,
					totalBoxOfficeCount,
					totalCompsCount,
					totalGross,
					totalHoldsCount,
					totalOnlineClientFeesInCents,
					totalOpenCount,
					totalOrders,
					totalOrdersBoxOffice,
					totalOrdersOnline,
					totalRedeemedCount,
					totalReservedCount,
					totalSoldCount,
					totalSoldOnlineCount
				} = totals;

				//Summary Row of counts
				return (
					<div key={index}>
						<EventSettlementRow subHeading>
							{[
								name,
								"",
								totalSoldOnlineCount,
								totalBoxOfficeCount,
								totalSoldCount,
								totalCompsCount,
								dollars(totalGross) //TODO confirm correct field
							]}
						</EventSettlementRow>
						{sales.map((sale, pricingIndex) => {
							const {
								organization_id,
								event_id,
								ticket_type_id,
								ticket_pricing_id,
								hold_id,
								ticket_name,
								ticket_status,
								event_name,
								hold_name,
								ticket_pricing_name,
								ticket_pricing_price_in_cents,
								box_office_order_count,
								online_order_count,
								box_office_refunded_count,
								online_refunded_count,
								box_office_sales_in_cents,
								online_sales_in_cents,
								box_office_sale_count,
								online_sale_count,
								comp_sale_count,
								total_box_office_fees_in_cents,
								total_online_fees_in_cents,
								company_box_office_fees_in_cents,
								client_box_office_fees_in_cents,
								company_online_fees_in_cents,
								client_online_fees_in_cents,
								total_sold_count,
								total_sold_in_cents
							} = sale;

							return (
								<EventSettlementRow key={pricingIndex}>
									{[
										ticket_pricing_name,
										dollars(ticket_pricing_price_in_cents),
										online_order_count,
										box_office_order_count,
										total_sold_count,
										comp_sale_count,
										dollars(total_sold_in_cents) //TODO confirm correct field
									]}
								</EventSettlementRow>
							);
						})}
					</div>
				);
			})}

			<EventSettlementRow totalNoRadius>
				{[
					"Total sales",
					"",
					totals.totalSoldCount,
					totals.totalBoxOfficeCount,
					totals.totalSoldCount,
					totals.totalCompsCount,
					dollars(totals.totalGross) //TODO confirm correct field
				]}
			</EventSettlementRow>

			<EventSettlementRow total>
				{[
					"Total orders due",
					"",
					totals.totalOrdersOnline,
					totals.totalOrdersBoxOffice,
					totals.totalOrders,
					totals.totalCompsCount,
					dollars(totals.totalGross) //TODO confirm correct field
				]}
			</EventSettlementRow>
		</div>
	);
};

InventorySoldTable.propTypes = {
	tickets: PropTypes.object.isRequired,
	totals: PropTypes.object.isRequired
};

export default InventorySoldTable;