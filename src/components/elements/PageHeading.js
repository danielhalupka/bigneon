import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../styles/theme";

const styles = theme => {
	return {
		root: {
			display: "flex",
			marginBottom: theme.spacing.unit * 2
		},
		text: {
			color: theme.typography.headline.color,
			textTransform: "capitalize",
			fontFamily: fontFamilyDemiBold
		},
		icon: {
			width: 38,
			height: 38,
			marginRight: theme.spacing.unit * 2
		}
	};
};

const PageHeading = props => {
	const { classes, iconUrl, children } = props;

	return (
		<div className={classes.root}>
			{iconUrl ? (
				<img alt={children} src={iconUrl} className={classes.icon} />
			) : null}
			<Typography className={classes.text} variant="display1">
				{children}
			</Typography>
		</div>
	);
};

PageHeading.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired
};

export default withStyles(styles)(PageHeading);
