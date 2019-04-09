import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold, primaryHex, secondaryHex } from "../../config/theme";

const styles = theme => ({
	root: {
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit,
		paddingTop: theme.spacing.unit,
		paddingBottom: theme.spacing.unit / 2,
		borderRadius: "6px 6px 6px 0px"
	},
	default: {
		backgroundColor: "#FFE8F7",
		color: secondaryHex
	},
	green: {
		backgroundColor: "#EAF8EA",
		color: "#47C68A"
	},
	disabled: {
		backgroundColor: "rgb(93, 158, 198, 0.1)",
		color: "#ACBFCB"
	},
	text: {
		color: "inherit",
		fontSize: theme.typography.fontSize * 0.9,
		fontFamily: fontFamilyDemiBold
	}
});

const ColorTag = props => {
	const {
		classes,
		children,
		style,
		variant
	} = props;

	return (
		<div style={style} className={classNames({ [classes.root]: true, [classes[variant]]: true })}>
			<Typography className={classes.text}>{children}</Typography>
		</div>
	);
};

ColorTag.defaultPropTypes = {
	style: {},
	variant: "default"
};

ColorTag.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["default", "green", "disabled"]),
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array, PropTypes.string]).isRequired
};

export default withStyles(styles)(ColorTag);
