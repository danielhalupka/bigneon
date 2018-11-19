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
	callToActionBackground,
	fontFamilyDemiBold
} from "../styles/theme";

let minWidth = 160;

const styles = theme => {
	return {
		button: {
			minWidth,
			paddingTop: theme.spacing.unit * 1.5,
			paddingBottom: theme.spacing.unit * 1.5,
			borderRadius: 8
			// WebkitBorderImage:
			// 	"-webkit-gradient(linear, left top, left bottom, from(#00abeb), to(#fff), color-stop(0.5, #fff), color-stop(0.5, #66cc00)) 21 30 30 21 repeat repeat"
		},
		black: {
			border: `solid 0.5px #000000`
		},
		white: {
			border: `solid 0.5px #FFFFFF`
		},
		leftIcon: {
			marginRight: theme.spacing.unit,
			marginBottom: 2,
			width: 25,
			height: 25
		},
		whiteLabel: {
			color: "#FFFFFF",
			textTransform: "capitalize"
		},
		blackLabel: {
			color: "#000000",
			textTransform: "capitalize"
		}
	};
};

const AppButton = props => {
	const { classes, children, variant, color, ...rest } = props;

	const iconUrl = `/icons/${variant}-${color}.svg`;

	return (
		<Button
			classes={{
				root: classNames(classes.button, classes[color]),
				label: classes[`${color}Label`]
			}}
			target="_blank"
			{...rest}
		>
			<img alt={children} className={classes.leftIcon} src={iconUrl} />
			{children}
		</Button>
	);
};
AppButton.defaultProps = {
	size: "medium",
	variant: "default",
	color: "white"
};

AppButton.propTypes = {
	color: PropTypes.oneOf(["white", "black"]),
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["ios", "android"]),
	children: PropTypes.oneOfType([
		PropTypes.string
		// PropTypes.element,
		// PropTypes.array
	]).isRequired
	//iconUrl: PropTypes.string
};

export default withStyles(styles)(AppButton);
