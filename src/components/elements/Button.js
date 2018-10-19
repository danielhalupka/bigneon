//Base component https://material-ui.com/api/button/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import classNames from "classnames";

import {
	textColorPrimary,
	primaryHex,
	secondaryHex,
	warningHex,
	callToActionBackground
} from "../styles/theme";

const styles = {
	root: {
		borderRadius: 4,
		border: 0,
		paddingLeft: 30,
		paddingRight: 30,
		paddingTop: 10,
		paddingBottom: 10
	},
	primary: {
		background: primaryHex,
		color: "#FFF"
	},
	secondary: {
		background: secondaryHex,
		color: "#FFF"
	},
	default: {
		background: `linear-gradient(45deg, #FFF 10%, #FFF 90%)`,
		color: textColorPrimary
	},
	callToAction: {
		background: callToActionBackground,
		color: "#FFF",
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)"
	},
	warning: {
		background: `linear-gradient(45deg, ${warningHex} 10%, ${warningHex} 90%)`,
		color: "#FFF"
	},
	text: {
		background: "transparent",
		boxShadow: "none"
	},
	label: {
		textTransform: "none"
	}
};

const CustomButton = props => {
	const { classes, children, variant, disabled, ...rest } = props;

	return (
		<Button
			classes={{
				root: classNames(
					classes.root,
					!disabled ? classes[variant] || classes.default : classes.default
				),
				label: classes.label
			}}
			disabled={disabled}
			{...rest}
		>
			{children}
		</Button>
	);
};

CustomButton.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf([
		"primary",
		"secondary",
		"default",
		"callToAction",
		"warning",
		"text"
	]),
	disabled: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element,
		PropTypes.array
	]).isRequired
};

export default withStyles(styles)(CustomButton);
