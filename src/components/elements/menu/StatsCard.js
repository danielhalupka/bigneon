//Base component https://material-ui.com/api/card/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";

const styles = theme => {
	return {
		root: {
			borderRadius: 4,
			borderWidth: 0.5,
			borderColor: "#dee2e8",
			boxShadow: "0 2px 7px 1px rgba(112, 124, 237, 0.17)",
			border: "solid 0.5px #dee2e8",
			padding: theme.spacing.unit,
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2
		},

		label: {
			textTransform: "uppercase",
			fontSize: theme.typography.fontSize * 0.7
		},
		row: {
			paddingTop: theme.spacing.unit / 2,
			display: "flex"
		},
		value: {
			marginLeft: theme.spacing.unit,
			paddingTop: theme.spacing.unit / 2,
			fontSize: theme.typography.fontSize * 1.6
		},
		icon: { width: 25, height: 25 }
	};
};

const StatsCard = props => {
	const { classes, iconUrl, label, value, ...rest } = props;

	return (
		<Card className={classes.root} {...rest}>
			<Typography variant="caption" className={classes.label}>
				{label}
			</Typography>
			<div className={classes.row}>
				<img alt={label} src={iconUrl} className={classes.icon}/>
				<Typography variant="title" className={classes.value}>
					{value}
				</Typography>
			</div>
		</Card>
	);
};

StatsCard.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired
};

export default withStyles(styles)(StatsCard);
