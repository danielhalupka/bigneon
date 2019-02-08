import React from "react";
import PropTypes from "prop-types";
import EventSettlementRow from "./EventSettlementRow";
import { dollars } from "../../../../../helpers/money";

const RevenueShareTicket = props => {
	const { ticketFees, totalOrderFees, totalOtherFees } = props;
	const ticketTypeIds = Object.keys(ticketFees);

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
				const ticketTypeData = ticketFees[ticketTypeId];

				const {
					name,
					pricings,
					onlineTotalRevShare,
					boTotalRevShare,
					totalRevShare
				} = ticketTypeData;

				//Summary Row of counts
				return (
					<div key={index}>
						<EventSettlementRow subHeading>
							{[
								name,
								"",
								"",
								onlineTotalRevShare,
								"",
								boTotalRevShare,
								dollars(totalRevShare)
							]}
						</EventSettlementRow>

						{pricings.map((pricing, pricingIndex) => {
							const {
								name,
								priceInCents,
								onlineRevSharePerTicket,
								onlineTotalRevShare,
								boRevSharePerTicket,
								boTotalRevShare,
								totalRevShare
							} = pricing;

							return (
								<EventSettlementRow key={pricingIndex}>
									{[
										name,
										dollars(priceInCents),
										dollars(onlineRevSharePerTicket),
										dollars(onlineTotalRevShare),
										dollars(boRevSharePerTicket),
										dollars(boTotalRevShare),
										dollars(totalRevShare)
									]}
								</EventSettlementRow>
							);
						})}
					</div>
				);
			})}

			<EventSettlementRow subHeading>
				{[
					"Order fees",
					"",
					"",
					dollars(totalOrderFees.onlineTotalRevShare),
					"",
					dollars(totalOrderFees.boTotalRevShare),
					dollars(totalOrderFees.totalRevShare)
				]}
			</EventSettlementRow>

			<EventSettlementRow total>
				{[
					"Other fees",
					"",
					"",
					dollars(totalOtherFees.onlineTotalRevShare),
					"",
					dollars(totalOtherFees.boTotalRevShare),
					dollars(totalOtherFees.totalRevShare)
				]}
			</EventSettlementRow>
		</div>
	);
};

RevenueShareTicket.propTypes = {
	ticketFees: PropTypes.object.isRequired,
	totalOrderFees: PropTypes.object.isRequired,
	totalOtherFees: PropTypes.object.isRequired
};

export default RevenueShareTicket;
