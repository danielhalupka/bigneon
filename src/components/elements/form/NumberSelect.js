import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../../styles/theme";
import classnames from "classnames";

const styles = theme => {
	return {
		root: {
			display: "flex",
			justifyContent: "space-between",
			alignContent: "center",
			alignItems: "center",
			height: "100%",
			maxHeight: 40,
			maxWidth: 180
		},
		value: {
			fontSize: theme.typography.fontSize * 2.1,
			margin: 0,
			paddingTop: 10,
			height: "100%"
		},
		button: {
			cursor: "pointer",
			borderRadius: 30,
			width: 22,
			height: 22,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			paddingTop: 3
		},
		minusContainer: {
			backgroundColor: "#f5f6f7"
		},
		plusContainer: {
			backgroundColor: theme.palette.secondary.main
		},
		minusText: {
			lineHeight: 0,
			color: "black"
		},
		plusText: {
			lineHeight: 0,
			color: "#FFFFFF"
		}
	};
};

const Button = ({ classes, type, onClick }) => {
	return (
		<div
			onClick={onClick}
			className={classnames({
				noselect: true,
				[classes.button]: true,
				[classes.plusContainer]: type === "plus",
				[classes.minusContainer]: type === "minus"
			})}
		>
			{type === "minus" ? (
				<Typography className={classes.minusText}>-</Typography>
			) : null}
			{type === "plus" ? (
				<Typography className={classes.plusText}>+</Typography>
			) : null}
		</div>
	);
};

const NumberSelect = ({
	classes,
	children,
	onIncrement,
	onDecrement,
	style = {}
}) => {
	return (
		<div className={classes.root} style={style}>
			<Button type="minus" classes={classes} onClick={onDecrement}/>
			{/* <div> */}
			<Typography className={classes.value}>{children || "0"}</Typography>
			{/* </div> */}
			<Button type="plus" classes={classes} onClick={onIncrement}/>
		</div>
	);
};

NumberSelect.propTypes = {
	children: PropTypes.number,
	classes: PropTypes.object.isRequired,
	onIncrement: PropTypes.func.isRequired,
	onDecrement: PropTypes.func.isRequired,
	style: PropTypes.object
};

export default withStyles(styles)(NumberSelect);
