import React from "react";
import PropTypes from "prop-types";
import TotalsRow from "./TotalsRow";
import { dollars } from "../../../../../helpers/money";

const TotalsTable = props => {
	//TODO find out where the other values come from
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
		totalBoxOfficeClientFeesInCents,
		faceAmountOwedToClientInCents
	} = props;

	//const faceAmountOwed = 0;

	return (
		<div>
			<TotalsRow heading>{[ "Ticket", "" ]}</TotalsRow>

			<TotalsRow>
				{[ "Face Amount Owed To Client", dollars(faceAmountOwedToClientInCents) ]}
			</TotalsRow>

			<TotalsRow gray>
				{[ "Service Fee Revenue Share", dollars(totalOnlineClientFeesInCents + totalBoxOfficeClientFeesInCents) ]}
			</TotalsRow>

			{/*<TotalsRow>*/}
			{/*{[ "Credit card processing", "TODO" ]}*/}
			{/*</TotalsRow>*/}

			<TotalsRow total>
				{[ "Total Event Settlement", dollars(totalGross + totalOnlineClientFeesInCents + totalBoxOfficeClientFeesInCents) ]}
			</TotalsRow>
		</div>
	);
};

TotalsTable.propTypes = {
	totalOnlineClientFeesInCents: PropTypes.number.isRequired
	//TODO
};

export default TotalsTable;
