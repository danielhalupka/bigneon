import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Button from "../elements/Button";
import { Typography, withStyles } from "@material-ui/core";
import { fontFamilyDemiBold } from "../styles/theme";
import errorReporting from "../../helpers/errorReporting";

const styles = theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		flexDirection: "column"
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 3,
		color: "#AFC6D4",
		marginBottom: theme.spacing.unit * 2
	},
	image: {
		width: "50%",
		marginBottom: theme.spacing.unit * 2
	}
});

class NotFound extends Component {
	componentDidMount() {
		errorReporting.captureMessage(`React route not found: ${window.location.pathname}`, "warning");
	}

	render() {
		const { classes } = this.props;

		return (
			<div className={classes.root}>
				<img className={classes.image} alt={"Page not found"} src="/images/not-found.png"/>
				<Typography className={classes.heading}>Page not found</Typography>
				<Link to="/">
					<Button variant={"callToAction"}>Home</Button>
				</Link>
			</div>
		);
	}
}

NotFound.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NotFound);
