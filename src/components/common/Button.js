import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import classNames from "classnames";

import {
	textColorPrimary,
	textColorSecondary,
	primaryHex,
	secondaryHex,
	warningHex
} from "../styles/theme";

const styles = {
	root: {
		borderRadius: 3,
		border: 0,
		paddingLeft: 30,
		paddingRight: 30,
		paddingTop: 5,
		paddingBottom: 5,
		textDecoration: "none"
	},
	primary: {
		background: `linear-gradient(45deg, ${primaryHex} 10%, ${primaryHex} 90%)`,
		color: "#FFF"
	},
	secondary: {
		background: `linear-gradient(45deg, ${textColorSecondary} 10%, ${textColorSecondary} 90%)`,
		color: "#FFF"
	},
	default: {
		background: `linear-gradient(45deg, #FFF 10%, #FFF 90%)`,
		color: textColorPrimary
	},
	callToAction: {
		background: `linear-gradient(45deg, ${textColorSecondary} 10%, ${primaryHex} 30%, ${secondaryHex} 90%)`,
		color: "#FFF"
	},
	warning: {
		background: `linear-gradient(45deg, ${warningHex} 10%, ${warningHex} 90%)`,
		color: "#FFF"
	},
	label: {
		textTransform: "capitalize"
	}
};

const CustomButton = props => {
	const { classes, children, customClassName, disabled, ...rest } = props;

	return (
		<Button
			classes={{
				root: classNames(
					classes.root,
					!disabled
						? classes[customClassName] || classes.default
						: classes.default
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
	disabled: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element,
		PropTypes.array
	]).isRequired
};

export default withStyles(styles)(CustomButton);
