import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../../styles/theme";

const styles = theme => {
	return {
		root: {
			cursor: "pointer",
			marginRight: theme.spacing.unit * 2,
			display: "flex"
		},
		label: { color: "#868f9b" },
		labelActive: {
			fontFamily: fontFamilyDemiBold
		},
		square: {
			marginRight: theme.spacing.unit,
			borderStyle: "solid",
			borderColor: "#9da3b4",
			backgroundColor: "#afc6d4",
			opacity: 0.2,
			width: 20,
			height: 20,
			borderWidth: 0.5,
			borderRadius: 4
		},
		activeSquare: {
			backgroundImage: "linear-gradient(229deg, #e53d96, #5491cc)",
			marginRight: theme.spacing.unit,
			width: 20,
			height: 20,
			borderRadius: 4,
			display: "flex",
			justifyContent: "center",
			alignItems: "center"
		},
		checkmark: {
			width: 12,
			height: 12
		}
	};
};

const CheckBox = ({ active, children, onClick, classes, style = {} }) => {
	return (
		<div className={classes.root} onClick={onClick} style={style}>
			{active ? (
				<div className={classes.activeSquare}>
					<img className={classes.checkmark} src="/icons/checkmark-white.svg" />
				</div>
			) : (
				<div className={classes.square} />
			)}
			<Typography className={classes[active ? "labelActive" : "label"]}>
				{children}
			</Typography>
		</div>
	);
};

CheckBox.propTypes = {
	active: PropTypes.bool.isRequired,
	children: PropTypes.string.isRequired,
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func,
	style: PropTypes.object
};

export default withStyles(styles)(CheckBox);
