import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { fontFamilyDemiBold } from "../../../../../styles/theme";
import Button from "../../../../../elements/Button";

const styles = theme => {
	return {
		bar: {
			width: "100%",
			position: "fixed",
			bottom: 0,
			left: 80,
			zIndex: "100000; position:relative",
			justifyContent: "space-between",
			display: "flex",
			alignItems: "center",
			flex: 1,
			padding: theme.spacing.unit,
			paddingRight: 80 + theme.spacing.unit * 2, //Catering for width being 100% and end components going off page
			backgroundColor: "#FFFFFF",

			borderTop: "1px solid #DEE2E8"
		},
		text: {
			fontFamily: fontFamilyDemiBold,
			lineHeight: 1,
			fontSize: theme.typography.fontSize * 1.2
		},
		col1: {
			flex: 3
		},
		col2: {
			flex: 3
		},
		col3: {
			flex: 1,
			textAlign: "right"
		}
	};
};

const BottomRefundBar = ({
	classes,
	onSubmit,
	isRefunding,
	count,
	value_in_cents
}) => {

	const value = value_in_cents ? `$${(value_in_cents / 100).toFixed(2)}` : "$0";
	
	return (
		<div className={classes.bar}>
			<div className={classes.col1}>
				<Typography className={classes.text}>Total tickets to refund: {count}</Typography>
			</div>

			<div className={classes.col2}>
				<Typography className={classes.text}>Total value: {value}</Typography>
			</div>

			<div className={classes.col3}>
				<Button variant="callToAction" onClick={onSubmit} disabled={!value_in_cents || isRefunding}>
					{isRefunding ? "Refunding..." : `Refund ${value}`}
				</Button>
			</div>
		</div>
	);
};

BottomRefundBar.propTypes = {
	classes: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	isRefunding: PropTypes.bool,
	count: PropTypes.number.isRequired,
	value: PropTypes.number
};

export default withStyles(styles)(BottomRefundBar);
