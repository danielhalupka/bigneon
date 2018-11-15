//Base component https://material-ui.com/api/card/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import classNames from "classnames";

import { raisedCardBoxShadow } from "../styles/theme";
import TopCardIcon from "./TopCardIcon";

const styles = {
	root: {
		borderRadius: 4
	},
	default: {
		borderRadius: 3,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)",
		border: "solid 0.5px #dee2e8"
	},
	form: {
		borderRadius: 0,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)",
		border: "none"
	},
	raised: {
		boxShadow: raisedCardBoxShadow
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
		paddingBottom: 50
	},
	iconSpacer: {
		marginTop: 30
	}
};

const CustomCard = props => {
	const { classes, children, variant, iconUrl, ...rest } = props;

	let topIconSpan;
	let topIconSpacer;
	if (iconUrl) {
		topIconSpacer = <div className={classes.iconSpacer} />;
		topIconSpan = <TopCardIcon iconUrl={iconUrl} />;
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
				{...rest}
			>
				{topIconSpacer}
				{children}
			</Card>
		</div>
	);
};

CustomCard.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string,
	variant: PropTypes.oneOf([
		"default",
		"raised",
		"form",
		"dialog",
		"block",
		"subCard",
		"plain"
	]),
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(CustomCard);
