import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import TotalsTable from "./TotalsTable";
import InventorySoldTable from "./InventorySoldTable";
import RevenueShareTable from "./RevenueShareTable";

const styles = theme => {
	return {
		root: {
			marginBottom: theme.spacing.unit * 8
		},
		heading: {
			fontSize: theme.typography.fontSize * 1.6,
			fontFamily: fontFamilyDemiBold
		},
		subHeading: {
			fontSize: theme.typography.fontSize * 1.2,
			fontFamily: fontFamilyDemiBold,
			marginTop: theme.spacing.unit * 2
		},
		boldSpan: {
			fontFamily: fontFamilyDemiBold
		}
	};
};

const SingleEventSettlement = props => {
	const { classes, eventName, totals, tickets, displayStartDate, venue } = props;

	return (
		<div className={classes.root}>
			<Typography className={classes.heading}>{eventName}</Typography>
			<Typography>Event start date/time: <span className={classes.boldSpan}>{displayStartDate}</span></Typography>
			<Typography>Venue: <span className={classes.boldSpan}>{venue}</span></Typography>

			<Typography className={classes.subHeading}>Event totals</Typography>
			<TotalsTable {...totals}/>

			<Typography className={classes.subHeading}>Inventory sold (Net)</Typography>
			<InventorySoldTable totals={totals} tickets={tickets}/>

			<Typography className={classes.subHeading}>Service Fee Revenue Share & Box Office Fees</Typography>
			<RevenueShareTable totals={totals} tickets={tickets}/>
		</div>
	);
};

SingleEventSettlement.propTypes = {
	classes: PropTypes.object.isRequired,
	eventName: PropTypes.string.isRequired,
	tickets: PropTypes.object.isRequired,
	totals: PropTypes.object.isRequired,
	displayStartDate: PropTypes.string.isRequired,
	venue: PropTypes.string.isRequired
};

export default withStyles(styles)(SingleEventSettlement);