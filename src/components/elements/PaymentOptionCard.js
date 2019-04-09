import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold, primaryHex } from "../../config/theme";
import classnames from "classnames";

const styles = theme => ({
	root: {
		flex: 1,
		height: 75,
		borderRadius: 8,
		display: "flex",
		justifyContent: "space-around",
		alignItems: "center"
	},
	inactive: {
		borderStyle: "dashed",
		borderWidth: 0.5,
		borderColor: "#979797"
	},
	active: {
		backgroundColor: primaryHex
	},
	payWith: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.85,
		lineHeight: 1,
		marginLeft: 2
	},
	activeText: {
		color: "#FFFFFF"
	},
	type: {
		//fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.8,
		textTransform: "capitalize",
		lineHeight: 1,
		marginTop: theme.spacing.unit / 2
	},
	iconContainer: {
		//	borderStyle: "solid",
		height: "100%",
		flex: 1,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.unit * 2.5
	},
	icon: {
		width: "auto",
		height: "100%"
	},
	textContainer: {
		flex: 3,
		// borderStyle: "solid",
		// borderColor: "red",
		textAlign: "left"
	}
});

const PaymentOptionCard = props => {
	const { classes, type, active, onClick, style = {} } = props;

	let rootStyle = style;
	if (onClick) {
		rootStyle = { ...style, cursor: "pointer" };
	}

	const iconUrl = `/icons/${type === "cash" ? "cash" : "credit-card"}-${
		active ? "white" : "gray"
	}.svg`;

	return (
		<div
			style={rootStyle}
			onClick={onClick}
			className={classnames({
				[classes.root]: true,
				[classes.active]: active,
				[classes.inactive]: !active
			})}
		>
			<div className={classes.iconContainer}>
				<img alt={type} className={classes.icon} src={iconUrl}/>
			</div>
			<div className={classes.textContainer}>
				<Typography
					className={classnames({
						[classes.payWith]: true,
						[classes.activeText]: active
					})}
				>
					Pay with
				</Typography>
				<Typography
					className={classnames({
						[classes.type]: true,
						[classes.activeText]: active
					})}
				>
					{type}
				</Typography>
			</div>
		</div>
	);
};

PaymentOptionCard.propTypes = {
	classes: PropTypes.object.isRequired,
	type: PropTypes.oneOf(["cash", "credit"]),
	active: PropTypes.bool,
	onClick: PropTypes.func,
	style: PropTypes.object
};

export default withStyles(styles)(PaymentOptionCard);
