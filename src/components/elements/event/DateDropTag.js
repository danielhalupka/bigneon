import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../../styles/theme";

const styles = theme => ({
	root: {
		backgroundColor: "black",
		width: 60,
		height: 60,

		borderRadius: "0px 0px 4px 4px",
		textAlign: "center",

		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around"
	},
	text: {
		padding: 0,
		margin: 0,
		color: "#FFFFFF",
		lineHeight: 0
	},
	month: {
		fontSize: theme.typography.fontSize,
		fontFamily: fontFamilyDemiBold
	},
	day: {
		fontSize: theme.typography.fontSize * 2
	}
});

const DateDropTag = props => {
	const { classes, date } = props;

	return (
		<div className={classes.root}>
			<Typography
				className={classNames({ [classes.text]: true, [classes.month]: true })}
			>
				{date.format("MMM").toLowerCase()}
			</Typography>
			<Typography
				className={classNames({ [classes.text]: true, [classes.day]: true })}
			>
				{date.format("D")}
			</Typography>
		</div>
	);
};

DateDropTag.propTypes = {
	classes: PropTypes.object.isRequired,
	date: PropTypes.object.isRequired
};

export default withStyles(styles)(DateDropTag);
