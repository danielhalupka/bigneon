import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";

const styles = theme => {
	return {
		root: {
			cursor: "pointer",
			marginRight: theme.spacing.unit * 2,
			display: "flex"
		},
		disabledRoot: {
			cursor: "default"
		},
		label: { color: "#868f9b" },
		labelActive: {
			fontFamily: fontFamilyDemiBold
		},
		circle: {
			marginRight: theme.spacing.unit,
			borderStyle: "solid",
			borderColor: "#d1d1d1",
			width: 16,
			height: 16,
			borderWidth: 0.5,
			borderRadius: 10
		},
		activeCircle: {
			marginRight: theme.spacing.unit,
			borderStyle: "solid",
			borderColor: secondaryHex,
			width: 16,
			height: 16,
			borderRadius: 10,
			backgroundColor: secondaryHex
		},
		disabled: {
			borderColor: "#d1d1d1"
		},
		disabledActive: {
			borderColor: "#d1d1d1",
			backgroundColor: "#d1d1d1"
		}
	};
};

const RadioButton = props => {
	const { active, children, onClick, disabled, classes } = props;
	//classes[active ? "activeCircle" : "circle"]
	return (
		<div
			className={classnames({
				[classes.root]: true,
				[classes.disabledRoot]: disabled
			})}
			onClick={disabled ? null : onClick}
		>
			<div
				className={classnames({
					[classes.circle]: !active,
					[classes.activeCircle]: active,
					[classes.disabled]: disabled && !active,
					[classes.disabledActive]: disabled && active
				})}
			/>
			{children ? (
				<Typography className={classes[active ? "labelActive" : "label"]}>
					{children}
				</Typography>
			) : null}
		</div>
	);
};

RadioButton.propTypes = {
	active: PropTypes.bool.isRequired,
	disabled: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(RadioButton);
