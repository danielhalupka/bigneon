import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import classNames from "classnames";

import {
	textColorPrimary,
	textColorSecondary,
	primaryHex,
	secondaryHex
} from "../styles/theme";

const styles = {
	root: {
		borderRadius: 3,
		border: 0,
		paddingLeft: 30,
		paddingRight: 30,
		paddingTop: 5,
		paddingBottom: 5,
		boxShadow: "0 2px 2px 0px rgba(1, 1, 1, .2)",
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
	label: {
		textTransform: "capitalize"
	}
};

const CustomButton = props => {
	const {
		classes,
		children,
		customClassName,
		onClick,
		style,
		type,
		disabled,
		size
	} = props;

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
			onClick={onClick}
			style={style}
			type={type}
			disabled={disabled}
			size={size}
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
	]).isRequired,
	onClick: PropTypes.func,
	style: PropTypes.object,
	type: PropTypes.string,
	size: PropTypes.string
};

export default withStyles(styles)(CustomButton);
