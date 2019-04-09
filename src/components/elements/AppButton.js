//Base component https://material-ui.com/api/button/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import classNames from "classnames";
import { callToActionBackground, fontFamilyBold, fontFamilyDemiBold } from "../../config/theme";

const styles = theme => {
	return {
		button: {
			minWidth: 180,
			paddingTop: theme.spacing.unit * 1.5,
			paddingBottom: theme.spacing.unit * 1.5,
			borderRadius: 8,
			[theme.breakpoints.down("xs")]: {
				minWidth: 120
			}
			// WebkitBorderImage:
			// 	"-webkit-gradient(linear, left top, left bottom, from(#00abeb), to(#fff), color-stop(0.5, #fff), color-stop(0.5, #66cc00)) 21 30 30 21 repeat repeat"
		},
		blackBackground: {
			backgroundColor: "#000000"
		},
		black: {
			border: `solid 0.5px #000000`
		},
		white: {
			border: `solid 0.5px #FFFFFF`
		},
		callToAction: {
			background: callToActionBackground,
			color: "#FFF",
			boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)",
			backgroundRepeat: "no-repeat"
		},
		leftIcon: {
			marginRight: theme.spacing.unit,
			marginBottom: 2,
			width: "auto",
			height: "100%"
		},
		whiteLabel: {
			color: "#FFFFFF",
			textTransform: "capitalize"
		},
		blackLabel: {
			color: "#000000",
			textTransform: "capitalize"
		},
		blackBackgroundLabel: {
			color: "#FFFFFF",
			textTransform: "capitalize"
		},
		callToActionLabel: {
			color: "#FFFFFF",
			textTransform: "capitalize",
			fontFamily: fontFamilyBold
		},
		hover: {
			backgroundColor: "red"
		},
		buttonContents: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center"
		},
		iconContainer: {
			display: "flex",
			justifyContent: "flex-start"
		},
		labelContainer: {
			flex: 1,
			paddingTop: 2,
			fontFamily: "inherit",
			fontSize: "inherit",
			font: "inherit"
		}
	};
};

const AppButton = props => {
	const { classes, children, variant, color, ...rest } = props;

	const iconColor = color === "blackBackground" || color === "callToAction" ? "white" : color;

	const iconUrl = variant ? `/icons/${variant}-${iconColor}.svg` : null;

	let labelStyle = { paddingRight: variant ? "5%" : 0 };
	if (typeof children === "string" && children.toLowerCase() === "ios") {
		labelStyle = { ...labelStyle, textTransform: "none" };
	}

	return (
		<Button
			classes={{
				root: classNames({ [classes.button]: true, [classes[color]]: true, [classes.buttonContents]: true }),
				label: classes[`${color}Label`]
			}}
			target="_blank"
			{...rest}
		>
			{iconUrl ? (
				<div className={classes.iconContainer}>
					<img className={classes.leftIcon} src={iconUrl}/>
				</div>
			) : null }
			<div className={classes.labelContainer} style={labelStyle}>
				{children}
			</div>
		</Button>
	);
};
AppButton.defaultProps = {
	variant: "default",
	color: "white",
	style: {}
};

AppButton.propTypes = {
	color: PropTypes.oneOf(["white", "black", "blackBackground", "callToAction"]),
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["ios", "android", false]),
	children: PropTypes.oneOfType([
		PropTypes.string
		// PropTypes.element,
		// PropTypes.array
	]).isRequired
	//iconUrl: PropTypes.string
};

export default withStyles(styles)(AppButton);
