//Base component https://material-ui.com/api/card/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import classNames from "classnames";

import TopCardIcon from "./TopCardIcon";

const styles = theme => ({
	root: {
		borderRadius: 4
	},
	default: {
		borderRadius: 8,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)",
		border: "solid 0.5px #dee2e8"
	},
	form: {
		borderRadius: 0,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)",
		border: "none"
	},
	raised: {
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.69)"
	},
	raisedLight: {
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.3)"
	},
	block: {
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)",
		borderRadius: 0,
		border: "none"
	},
	subCard: {
		boxShadow: "0 2px 7px 1px rgba(112, 124, 237, 0.17)",
		borderRadius: 8,
		border: "none"
	},
	plain: {
		boxShadow: "none",
		borderRadius: 0,
		border: "none"
	},
	dialog: {
		borderRadius: 8,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.69)",
		paddingLeft: 50,
		paddingRight: 50,
		paddingBottom: 20,
		[theme.breakpoints.down("sm")]: {
			paddingLeft: 5,
			paddingRight: 5
		}
	},
	iconSpacer: {
		marginTop: 30
	},
	topBorderHighlight: {
		height: 6,
		marginRight: "10%",
		marginLeft: "10%",
		backgroundImage: "linear-gradient(to left, #e53d96, #5491cc)"
	}
});

const CustomCard = props => {
	const {
		classes,
		children,
		variant,
		iconUrl,
		style = {},
		topBorderHighlight,
		borderLess,
		...rest
	} = props;

	let topIconSpan;
	let topIconSpacer;
	if (iconUrl) {
		topIconSpacer = <div className={classes.iconSpacer}/>;
		topIconSpan = <TopCardIcon iconUrl={iconUrl}/>;
	}

	let topBorder;
	if (topBorderHighlight) {
		topBorder = <div className={classes.topBorderHighlight}/>;
	}

	if (borderLess) {
		style.border = "none";
	}

	return (
		<div>
			{topIconSpan}
			<Card
				classes={{
					root: classNames(
						classes.root,
						classes[variant] ? classes[variant] : classes.default
					),
					label: classes.label
				}}
				style={style}
				{...rest}
			>
				{topBorder}
				{topIconSpacer}
				{children}
			</Card>
		</div>
	);
};

CustomCard.defaultPropTypes = {
	style: {},
	borderLess: false
};

CustomCard.propTypes = {
	topBorderHighlight: PropTypes.bool,
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string,
	style: PropTypes.object,
	variant: PropTypes.oneOf([
		"default",
		"raised",
		"raisedLight",
		"form",
		"dialog",
		"block",
		"subCard",
		"plain"
	]),
	borderLess: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(CustomCard);
