import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { fontFamilyDemiBold } from "../../../styles/theme";

const styles = theme => {
	return {
		root: {},
		icon: {
			height: 100,
			width: "auto"
		},
		text: {
			fontSize: theme.typography.fontSize * 1.5,
			fontFamily: fontFamilyDemiBold
		}
	};
};

const BlankSlate = props => {
	const { classes, children } = props;

	return (
		<div className={classes.root}>
			<img
				className={classes.icon}
				src="/icons/tickets-multi.svg"
				alt="box-office"
			/>
			<Typography className={classes.text}>{children}</Typography>
		</div>
	);
};

BlankSlate.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired
};

export default withStyles(styles)(BlankSlate);
