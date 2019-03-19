import React from "react";
import PropTypes from "prop-types";
import TotalsRow from "./TotalsRow";
import { dollars } from "../../../../../helpers/money";
import { Typography, withStyles } from "@material-ui/core";
import { fontFamilyDemiBold, secondaryHex } from "../../../../styles/theme";

const styles = theme => ({
	root: {},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3,
		marginBottom: 10
	},
	boldText: {
		fontFamily: fontFamilyDemiBold
	},
	adjustmentText: {
		fontSize: theme.typography.fontSize * 0.9,
		fontFamily: fontFamilyDemiBold,
		marginTop: 10
	},
	editText: {
		fontFamily: fontFamilyDemiBold,
		cursor: "pointer",
		color: secondaryHex
	}
});

const GrandTotalsTable = props => {
	const {
		classes,
		totalFaceAmountOwedToClientInCents,
		totalServiceFeesRevenueShareInCents,
		adjustmentsInCents,
		onEditAdjustments,
		adjustmentNotes,
		totalSettlementInCents
	} = props;

	return (
		<div>
			<Typography className={classes.heading}>
				Grand totals
			</Typography>

			<TotalsRow heading>{[ "Total", "" ]}</TotalsRow>

			<TotalsRow>
				{[ "Face amount owed to client", dollars(totalFaceAmountOwedToClientInCents) ]}
			</TotalsRow>

			<TotalsRow gray>
				{[ "Service fee revenue share", dollars(totalServiceFeesRevenueShareInCents) ]}
			</TotalsRow>

			<TotalsRow>
				{[
					<span key={"adjustments"} className={classes.adjustmentText}>
						Adjustments&nbsp;
						<span className={classes.editText} onClick={onEditAdjustments}>Edit adjustments</span>
					</span>,
					dollars(adjustmentsInCents)
				]}
			</TotalsRow>

			<TotalsRow total>
				{[ "Total Settlement", dollars(totalSettlementInCents) ]}
			</TotalsRow>

			<Typography className={classes.adjustmentText}>
				<span className={classes.boldText}>Adjustment Notes:</span> {adjustmentsInCents > 0 ? adjustmentNotes : "No adjustments applies"}
			</Typography>
		</div>
	);
};

GrandTotalsTable.propTypes = {
	classes: PropTypes.object.isRequired,
	adjustmentsInCents: PropTypes.number.isRequired,
	onEditAdjustments: PropTypes.func.isRequired,
	adjustmentNotes: PropTypes.string,
	totalFaceAmountOwedToClientInCents: PropTypes.number.isRequired,
	totalServiceFeesRevenueShareInCents: PropTypes.number.isRequired,
	totalSettlementInCents: PropTypes.number.isRequired
};

export default withStyles(styles)(GrandTotalsTable);
