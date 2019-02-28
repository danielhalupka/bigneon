import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { fontFamilyDemiBold } from "../../../styles/theme";
import Button from "../../../elements/Button";

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
			flex: 2,
			textAlign: "right"
		},
		col4: {
			flex: 1,
			textAlign: "right",
			paddingLeft: theme.spacing.unit
		}
	};
};

const BottomCompleteOrderBar = ({
	classes,
	onSubmit,
	col1Text,
	col2Text,
	col3Text,
	buttonText,
	disabledButtonText,
	disabled
}) => {
	return (
		<div className={classes.bar}>
			<div className={classes.col1}>
				<Typography className={classes.text}>{col1Text}</Typography>
			</div>

			{col2Text ? (
				<div className={classes.col2}>
					<Typography className={classes.text}>{col2Text}</Typography>
				</div>
			) : null}

			<div className={classes.col3}>
				<Typography className={classes.text}>{col3Text}</Typography>
			</div>

			<div className={classes.col4}>
				<Button variant="callToAction" onClick={onSubmit} disabled={disabled}>
					{disabled ? disabledButtonText : buttonText}
				</Button>
			</div>
		</div>
	);
};

BottomCompleteOrderBar.propTypes = {
	classes: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	col1Text: PropTypes.string.isRequired,
	col2Text: PropTypes.string,
	col3Text: PropTypes.string.isRequired,
	buttonText: PropTypes.string.isRequired,
	disabledButtonText: PropTypes.string.isRequired
};

export default withStyles(styles)(BottomCompleteOrderBar);
