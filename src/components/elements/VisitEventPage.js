import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
	root: {
		display: "flex",
		justifyContent: "center"
	},
	link: {
		display: "flex",
		alignItems: "center"
	},
	icon: {
		marginLeft: theme.spacing.unit,
		width: "auto",
		height: 10,
		marginBottom: 5
	},
	text: {
		color: "#9DA3B4"
	}
});

const VisitEventPage = props => {
	const { classes, id, style } = props;

	const label = "Visit event page";

	return (
		<div style={style} className={classes.root}>
			<a href={`/events/${id}`} target={"_blank"} className={classes.link}>
				<Typography className={classes.text}>{label}</Typography>
				<img alt={label} src="/icons/right-active.svg" className={classes.icon}/>
			</a>
		</div>
	);
};

VisitEventPage.propTypes = {
	classes: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	style: PropTypes.object
};

export default withStyles(styles)(VisitEventPage);
