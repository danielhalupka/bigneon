import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import classNames from "classnames";

const styles = theme => ({
	root: {
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		display: "flex",
		alignItems: "center"
	},
	shaded: {
		backgroundColor: "#F5F7FA",
		borderRadius: 8
	}
});

const FeeRow = props => {
	const { children, shaded, classes } = props;

	const columnStyles = [
		{ flex: 3, textAlign: "left" },
		{ flex: 3, textAlign: "left" },
		{ flex: 3, textAlign: "center" },
		{ flex: 2, textAlign: "center" },
		{ flex: 2, textAlign: "center" }
	];

	const columns = children.map((child, index) => {
		return (
			<span key={index} style={columnStyles[index]}>
				{child}
			</span>
		);
	});

	return (
		<div
			className={classNames({
				[classes.root]: true,
				[classes.shaded]: !!shaded
			})}
		>
			{columns}
		</div>
	);
};

FeeRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	shaded: PropTypes.bool
};

export default withStyles(styles)(FeeRow);
