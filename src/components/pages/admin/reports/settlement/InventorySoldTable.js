import React from "react";
import PropTypes from "prop-types";
import EventSettlementRow from "./EventSettlementRow";
import { dollars } from "../../../../../helpers/money";

const InventorySoldTable = props => {
	const { ticketSales, totalSales, totalOrdersDue } = props;

	const ticketTypeIds = Object.keys(ticketSales);

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
				const ticketTypeData = ticketSales[ticketTypeId];
				const {
					name,
					pricings,
					onlineCount,
					boxOfficeCount,
					totalSold,
					totalComps,
					totalOwedInCents
				} = ticketTypeData;

				//Summary Row of counts
				return (
					<div key={index}>
						<EventSettlementRow subHeading>
							{[
								name,
								"",
								onlineCount,
								boxOfficeCount,
								totalSold,
								totalComps,
								dollars(totalOwedInCents)
							]}
						</EventSettlementRow>
						{pricings.map((pricing, pricingIndex) => {
							const {
								name,
								priceInCents,
								onlineCount,
								boxOfficeCount,
								totalSold,
								totalComps,
								totalOwedInCents
							} = pricing;

							return (
								<EventSettlementRow key={pricingIndex}>
									{[
										name,
										dollars(priceInCents),
										onlineCount,
										boxOfficeCount,
										totalSold,
										totalComps,
										dollars(totalOwedInCents)
									]}
								</EventSettlementRow>
							);
						})}
					</div>
				);
			})}

			<EventSettlementRow subHeading>
				{[
					"Total sales",
					"",
					totalSales.onlineCount,
					totalSales.boxOfficeCount,
					totalSales.totalSold,
					totalSales.totalComps,
					dollars(totalSales.totalOwedInCents)
				]}
			</EventSettlementRow>

			<EventSettlementRow total>
				{[
					"Total orders due",
					"",
					totalOrdersDue.onlineCount,
					totalOrdersDue.boxOfficeCount,
					totalOrdersDue.totalSold,
					"",
					dollars(totalOrdersDue.totalOwedInCents)
				]}
			</EventSettlementRow>
		</div>
	);
};

InventorySoldTable.propTypes = {
	ticketSales: PropTypes.object.isRequired,
	totalSales: PropTypes.object.isRequired,
	totalOrdersDue: PropTypes.object.isRequired
};

export default InventorySoldTable;
