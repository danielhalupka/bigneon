//Base component https://material-ui.com/api/button/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import classNames from "classnames";

import {
	textColorPrimary,
	primaryHex,
	secondaryHex,
	warningHex,
	callToActionBackground
} from "../styles/theme";

const styles = {
	root: {
		borderRadius: 4
	},
	default: {
		borderRadius: 3,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)",
		border: "solid 0.5px #dee2e8"
	},
	raised: {
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.69)" //TODO move this to theme.js
	}
};

const CustomCard = props => {
	const { classes, children, variant, ...rest } = props;

	return (
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
			{children}
		</Card>
	);
};

CustomCard.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["default", "raised"]),
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(CustomCard);
