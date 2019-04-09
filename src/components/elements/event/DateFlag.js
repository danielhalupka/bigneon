import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../../../config/theme";

const width = 60;
const height = 60;

const styles = theme => ({
	root: {
		backgroundColor: "black",
		width,
		height,
		textAlign: "center",
		borderRadius: "0px 0px 4px 4px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around",
		paddingTop: 6,
		paddingBottom: 4
	},
	small: {
		width,
		height
	},
	medium: {
		width: width * 1.2,
		height: height * 1.2
	},
	large: {
		width: width * 1.5,
		height: height * 1.5
	},
	rounded: {
		borderRadius: 4
	},
	text: {
		padding: 0,
		margin: 0,
		color: "#FFFFFF",
		lineHeight: 0.8
	},
	dayOfWeek: {
		fontSize: theme.typography.fontSize,
		fontFamily: fontFamilyDemiBold
	},
	month: {
		fontSize: theme.typography.fontSize,
		fontFamily: fontFamilyDemiBold
	},
	day: {
		marginTop: 4,
		fontSize: theme.typography.fontSize * 1.8
	}
});

const DateFlag = props => {
	const { classes, date, variant, size } = props;

	const dayOfWeekText = (
		<Typography
			className={classNames({
				[classes.text]: true,
				[classes.dayOfWeek]: true
			})}
		>
			{date.format("ddd").toLowerCase()}
		</Typography>
	);

	const monthText = (
		<Typography
			className={classNames({ [classes.text]: true, [classes.month]: true })}
		>
			{date.format("MMM").toLowerCase()}
		</Typography>
	);

	const dayText = (
		<Typography
			className={classNames({ [classes.text]: true, [classes.day]: true })}
		>
			{date.format("D")}
		</Typography>
	);

	return (
		<div
			className={classNames({
				[classes.root]: true,
				[classes[size]]: true,
				[classes.rounded]: variant === "rounded"
			})}
		>
			{monthText}
			{dayText}
			{dayOfWeekText}
		</div>
	);
};

DateFlag.defaultPropTypes = {
	variant: "default",
	size: "medium"
};

DateFlag.propTypes = {
	classes: PropTypes.object.isRequired,
	date: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["default", "rounded"]),
	size: PropTypes.oneOf(["small", "medium", "large"])
};

export default withStyles(styles)(DateFlag);
