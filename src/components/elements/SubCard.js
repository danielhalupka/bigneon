//Base component https://material-ui.com/api/card/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import classNames from "classnames";

const styles = theme => ({
	root: {
		borderRadius: "0px 5px 5px 0px",
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.13)",
		marginBottom: theme.spacing.unit * 0.8,
		marginRight: theme.spacing.unit * 5
	},
	inactive: {
		borderLeft: "solid",
		borderWidth: 3,
		borderColor: theme.palette.primary.main
	},
	active: {
		borderLeft: "solid",
		borderWidth: 3,
		borderColor: theme.palette.secondary.main
	}
});

const SubCard = props => {
	const { classes, children, variant, active, ...rest } = props;

	return (
		<Card
			classes={{
				root: classNames(classes.root, classes[active ? "active" : "inactive"]),
				label: classes.label
			}}
			{...rest}
		>
			{children}
		</Card>
	);
};

SubCard.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["default"]),
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
		.isRequired,
	active: PropTypes.bool
};

export default withStyles(styles)(SubCard);
