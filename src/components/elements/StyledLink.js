import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

const styles = theme => {
	return {
		default: {
			borderBottom: "solid",
			borderWidth: 1.5,
			borderColor: "transparent",
			color: "transparent"
		},
		underlined: {
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

const StyledLink = props => {
	const { classes, children, to, underlined } = props;

	return (
		<Link to={to} className={classes[underlined ? "underlined" : "default"]}>
			<span className={classes.text}>{children}</span>
		</Link>
	);
};

StyledLink.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired,
	to: PropTypes.string.isRequired,
	underlined: PropTypes.bool
};

export default withStyles(styles)(StyledLink);
