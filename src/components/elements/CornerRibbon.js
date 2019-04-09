import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";

import { fontFamilyDemiBold } from "../../config/theme";

const styles = theme => ({
	root: {
		display: "flex",
		justifyContent: "flex-end"
	},
	ribbon: {
		width: "200px",
		position: "relative",
		textAlign: "center",
		color: "#f0f0f0",
		height: 30,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundRepeat: "no-repeat"
	},
	right: {
		right: -60,
		top: 22,
		transform: "rotate(45deg)"
	},
	cta: {
		backgroundImage: "linear-gradient(257deg, #e53d96, #5491cc)"
	},
	text: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		color: "#FFFFFF",
		fontSize: theme.typography.fontSize * 0.8
	}
});

const CornerRibbon = props => {
	const { children, classes } = props;

	return (
		<div className={classes.root}>
			<div
				className={classnames({
					[classes.ribbon]: true,
					[classes.right]: true,
					[classes.cta]: true
				})}
			>
				<Typography className={classes.text}>{children}</Typography>
			</div>
		</div>
	);
};

CornerRibbon.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired
};

export default withStyles(styles)(CornerRibbon);
