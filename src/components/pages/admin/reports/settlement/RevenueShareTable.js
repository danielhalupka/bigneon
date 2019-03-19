import React from "react";
import PropTypes from "prop-types";
import EventSettlementRow from "./EventSettlementRow";
import { dollars } from "../../../../../helpers/money";

const RevenueShareTable = props => {
	const { tickets, totals } = props;

	const ticketTypeIds = Object.keys(tickets);

	return (
		<div>
			<EventSettlementRow heading>
				{[
					"",
					"",
					"Online",
					"",
					"Box office",
					""
				]}
			</EventSettlementRow>
			<EventSettlementRow headingNoRadius>
				{[
					"Ticket",
					"Price",
					"Rev share per ticket",
					"Total rev share",
					"Rev share per ticket",
					"Total rev share",
					"Total rev share"
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
					totalSoldOnlineCount,
					totalBoxOfficeClientFeesInCents
				} = totals;

				//Summary Row of counts
				return (
					<div key={index}>
						<EventSettlementRow subHeading>
							{[
								name,
								"",
								"",
								dollars(totalOnlineClientFeesInCents),
								"",
								dollars(totalBoxOfficeClientFeesInCents),
								dollars(totalOnlineClientFeesInCents + totalBoxOfficeClientFeesInCents)
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
										name,
										dollars(ticket_pricing_price_in_cents),
										"TODO",
										dollars(client_online_fees_in_cents),
										"TODO",
										dollars(client_box_office_fees_in_cents),
										dollars(client_online_fees_in_cents + client_box_office_fees_in_cents)
									]}
								</EventSettlementRow>
							);
						})}
					</div>
				);
			})}

			{/*faceAmountOwedToClientInCents: 0*/}
			{/*totalAllocation: 1350*/}
			{/*totalBoxOfficeClientFeesInCents: 0*/}
			{/*totalBoxOfficeCount: 0*/}
			{/*totalCompsCount: 0*/}
			{/*totalGross: 0*/}
			{/*totalHoldsCount: 0*/}
			{/*totalOnlineClientFeesInCents: 0*/}
			{/*totalOpenCount: 1350*/}
			{/*totalOrders: 0*/}
			{/*totalOrdersBoxOffice: 0*/}
			{/*totalOrdersOnline: 0*/}
			{/*totalRedeemedCount: 0*/}
			{/*totalReservedCount: 0*/}
			{/*totalSoldCount: 0*/}
			{/*totalSoldOnlineCount: 0*/}

			<EventSettlementRow subHeading>
				{[
					"Order fees",
					"",
					"",
					dollars(totals.totalOnlineClientFeesInCents),
					"",
					dollars(totals.totalBoxOfficeClientFeesInCents),
					dollars(totals.totalOnlineClientFeesInCents + totals.totalBoxOfficeClientFeesInCents)
				]}
			</EventSettlementRow>

			<EventSettlementRow total>
				{[
					"Other fees",
					"",
					"",
					"TODO",
					"",
					"TODO",
					"TODO"
				]}
			</EventSettlementRow>
		</div>
	);
};

RevenueShareTable.propTypes = {
	tickets: PropTypes.object.isRequired,
	totals: PropTypes.object.isRequired
};

export default RevenueShareTable;