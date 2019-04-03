import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import { fontFamilyDemiBold } from "../../styles/theme";
import "./loader.css";
const loadingImage = require("./loading.svg");

const styles = theme => ({
	root: {
		display: "flex",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		flex: 1,
		height: "100%",
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2
	},
	text: {
		color: "#9E9E9E",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	},
	icon: {
		height: 35,
		width: "auto",
		marginRight: theme.spacing.unit
	}
});

const Loader = props => {
	const { children, classes, style } = props;

	return (
		<div className={classes.root} style={style}>
			<img className={classnames(classes.icon, "loader-image")} alt={children} src={loadingImage}/>
			{children ? <Typography className={classes.text}>{children}</Typography> : null}
		</div>
	);
};

Loader.defaultProps = {
	children: "Loading...",
	style: {}
};

Loader.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string,
	style: PropTypes.object
};

export default withStyles(styles)(Loader);
