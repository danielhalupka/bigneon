import React from "react";
import PropTypes from "prop-types";
import TotalsRow from "./TotalsRow";
import { dollars } from "../../../../../helpers/money";

const TotalsTable = props => {
	const { rows } = props;

	return (
		<div>
			<TotalsRow heading>{[ "Ticket", "" ]}</TotalsRow>

			{rows.map((row, index) => {
				const typeProp = { };

				if (index + 1 === rows.length) {
					typeProp.total = true;
					typeProp.gray = false;
				} else {
					const isOdd = index % 2;

					typeProp.gray = !!isOdd;
					typeProp.darkGray = !isOdd;
				}

				return (
					<TotalsRow key={index} {...typeProp}>
						{[
							row.label,
							dollars(row.valueInCents)
						]}
					</TotalsRow>
				);
			})}
		</div>
	);
};

TotalsTable.propTypes = {
	rows: PropTypes.array.isRequired
};

export default TotalsTable;
