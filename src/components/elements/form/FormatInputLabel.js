import React from "react";
import { withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import InputLabel from "@material-ui/core/InputLabel";

import { secondaryHex } from "../../../config/theme";

const styles = theme => {
	return {
		astrix: {
			color: secondaryHex
		},
		superText: {
			cursor: "pointer"
		}
	};
};

//If it ends in an asterisk, change that color of that asterisk
const FormatInputLabel = ({ classes, children, superText, onSuperTextClick, extra }) => {
	const superTextLabel = superText ? <span className={classes.superText} onClick={onSuperTextClick}> ({superText})</span> : null;

	if (children && children.endsWith("*")) {
		return (
			<span>
				{children.substring(0, children.length - 1)}
				<span className={classes.astrix}>&nbsp;*</span>
				{superTextLabel}
			</span>
		);
	}

	return <span>{children}{superTextLabel}</span>;
};

FormatInputLabel.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string.isRequired,
	superText: PropTypes.string,
	onSuperTextClick: (props, propName, componentName) => {
		if ((props.superText && (props[propName] == undefined || typeof (props[propName]) != "function"))) {
			return new Error(`${componentName} is a required function if superText is set.`);
		}
	}
};

export default withStyles(styles)(FormatInputLabel);
