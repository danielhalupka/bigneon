import React from "react";
import PropTypes from "prop-types";
import { withStyles, Card } from "@material-ui/core";
import classNames from "classnames";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		display: "flex"
	},
	itemContainer: {
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.07)"
	},
	text: {
		textTransform: "uppercase"
	},
	itemText: {}
});

const OrderRow = props => {
	const { item, children, classes } = props;

	const columnStyles = [
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "center" },
		{ flex: 8, textAlign: "left" },
		{ flex: 1, textAlign: "center" },
		{ flex: 2, textAlign: "right" }
	];

	const columns = children.map((child, index) => {
		return (
			<span
				className={item ? classes.itemText : classes.text}
				key={index}
				style={columnStyles[index]}
			>
				{child}
			</span>
		);
	});

	if (item) {
		return (
			<Card
				classes={{
					root: classNames(classes.root, classes.itemContainer)
				}}
			>
				{columns}
			</Card>
		);
	}

	return <div className={classes.root}>{columns}</div>;
};

OrderRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	item: PropTypes.bool
};

export default withStyles(styles)(OrderRow);
