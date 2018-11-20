import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import classnames from "classnames";

const styles = theme => {
	return {
		default: {
			borderBottom: "solid",
			borderWidth: 1.5,
			borderColor: "transparent",
			color: "transparent",
			cursor: "pointer"
		},
		underlined: {
			borderBottom: "solid",
			borderWidth: 1.5,
			borderColor: theme.palette.secondary.main,
			color: theme.palette.secondary.main,
			cursor: "pointer"
		},
		text: {
			color: theme.palette.text.primary
		}
	};
};

const StyledLink = props => {
	const { classes, children, to, underlined, onClick } = props;

	const inner = <span className={classes.text}>{children}</span>;

	const outerClasses = classnames({
		[classes.default]: !underlined,
		[classes.underlined]: underlined
	});

	if (to) {
		return (
			<Link to={to} className={outerClasses} onClick={onClick}>
				{inner}
			</Link>
		);
	}

	return (
		<a className={outerClasses} onClick={onClick}>
			{inner}
		</a>
	);
};

StyledLink.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
	to: PropTypes.string,
	onClick: PropTypes.func,
	underlined: PropTypes.bool
};

export default withStyles(styles)(StyledLink);
