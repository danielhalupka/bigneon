import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

const styles = theme => {
	return {
		root: {
			borderBottom: "solid",
			borderWidth: 1.5,
			borderColor: theme.palette.secondary.main,
			color: theme.palette.secondary.main
		},
		text: {
			color: theme.palette.text.primary
		}
	};
};

const UnderlinedLink = props => {
	const { classes, children, to } = props;

	return (
		<Link to={to} className={classes.root}>
			<span className={classes.text}>{children}</span>
		</Link>
	);
};

UnderlinedLink.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired,
	to: PropTypes.string.isRequired
};

export default withStyles(styles)(UnderlinedLink);
