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
		thinUnderlined: {
			borderWidth: 1
		},
		text: {
			color: theme.palette.text.primary
		}
	};
};

const StyledLink = props => {
	const {
		classes,
		children,
		to,
		underlined,
		thin,
		href,
		target,
		onClick
	} = props;

	const inner = <span className={classes.text}>{children}</span>;

	const outerClasses = classnames({
		[classes.default]: !underlined,
		[classes.underlined]: underlined,
		[classes.thinUnderlined]: thin
	});

	if (to) {
		return (
			<Link to={to} className={outerClasses} onClick={onClick}>
				{inner}
			</Link>
		);
	}

	return (
		<a className={outerClasses} href={href} target={target} onClick={onClick}>
			{inner}
		</a>
	);
};

StyledLink.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
	to: PropTypes.string, //Use this to user react-router
	href: PropTypes.string, //Use this if it needs to load a new page
	target: PropTypes.string,
	onClick: PropTypes.func,
	underlined: PropTypes.bool,
	thin: PropTypes.bool //Thinner underlining
};

export default withStyles(styles)(StyledLink);
