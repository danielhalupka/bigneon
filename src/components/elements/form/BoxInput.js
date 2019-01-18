import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

const height = 50;

const styles = theme => {
	return {
		root: {
			width: "100%",
			display: "flex",
			border: "1px solid #D1D1D1",
			borderRadius: 8,
			height,
			alignItems: "center",
			backgroundColor: "#FFFFFF"
		},
		inputContainer: {
			flex: 3,
			padding: theme.spacing.unit / 2,
			paddingLeft: theme.spacing.unit * 2
		},
		input: {
			fontSize: theme.typography.fontSize * 0.9,
			width: "100%",
			height: "100%",
			borderStyle: "none"
		}
	};
};

const BoxInput = props => {
	const { classes, style } = props;

	return (
		<div className={classes.root} style={style}>
			<div className={classes.inputContainer}>
				<input className={classes.input} {...props}/>
			</div>
		</div>
	);
};

BoxInput.defaultPropTypes = {
	buttonText: "Submit",
	style: {}
};

BoxInput.propTypes = {
	classes: PropTypes.object.isRequired,
	name: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	style: PropTypes.object
};

export default withStyles(styles)(BoxInput);
