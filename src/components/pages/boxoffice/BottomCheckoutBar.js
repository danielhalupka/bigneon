import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { fontFamilyDemiBold } from "../../styles/theme";
import Button from "../../elements/Button";

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
			padding: theme.spacing.unit * 2,
			paddingRight: 80 + theme.spacing.unit * 2, //Catering for width being 100% and end components going off page
			backgroundColor: "#FFFFFF",

			borderTop: "1px solid #DEE2E8"
		},
		text: {
			fontFamily: fontFamilyDemiBold,
			lineHeight: 1,
			fontSize: theme.typography.fontSize * 1.2
		},
		selectedCol: {
			flex: 4
		},
		totalCol: {
			flex: 2,
			textAlign: "right"
		},
		buttonCol: {
			flex: 1,
			textAlign: "right"
		}
	};
};

const BottomCheckoutBar = ({
	classes,
	totalNumberSelected = 0,
	totalInCents = 0,
	onCheckout
}) => {
	return (
		<div className={classes.bar}>
			<div className={classes.selectedCol}>
				<Typography className={classes.text}>
					Total tickets selected: {totalNumberSelected}
				</Typography>
			</div>

			<div className={classes.totalCol}>
				<Typography className={classes.text}>
					Order total: ${(totalInCents / 100).toFixed(2)}
				</Typography>
			</div>

			<div className={classes.buttonCol}>
				<Button
					variant="callToAction"
					onClick={onCheckout}
					disabled={!(totalNumberSelected > 0)}
				>
					Checkout
				</Button>
			</div>
		</div>
	);
};

BottomCheckoutBar.propTypes = {
	classes: PropTypes.object.isRequired,
	totalNumberSelected: PropTypes.number,
	totalInCents: PropTypes.number,
	onCheckout: PropTypes.func.isRequired
};

export default withStyles(styles)(BottomCheckoutBar);
