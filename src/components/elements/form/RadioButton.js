import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const styles = theme => {
	return {
		root: {
			cursor: "pointer",
			marginRight: theme.spacing.unit * 2,
			display: "flex"
		},
		label: { color: "#868f9b" },
		labelActive: {
			fontFamily: "TTCommons-DemiBold"
		},
		circle: {
			marginRight: theme.spacing.unit,
			borderStyle: "solid",
			borderColor: "#d1d1d1",
			width: 16,
			height: 16,
			borderWidth: 0.5,
			borderRadius: 10
		},
		activeCircle: {
			marginRight: theme.spacing.unit,
			borderStyle: "solid",
			borderColor: theme.palette.secondary.main,
			width: 16,
			height: 16,
			borderRadius: 10
		}
	};
};

const RadioButton = props => {
	const { active, children, onClick, classes } = props;

	return (
		<div className={classes.root} onClick={onClick}>
			<div className={classes[active ? "activeCircle" : "circle"]} />
			<Typography className={classes[active ? "labelActive" : "label"]}>
				{children}
			</Typography>
		</div>
	);
};

RadioButton.propTypes = {
	active: PropTypes.bool.isRequired,
	children: PropTypes.string.isRequired,
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(RadioButton);
