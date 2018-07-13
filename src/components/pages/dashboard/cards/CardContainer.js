import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Paper } from "@material-ui/core";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 2
	}
});

const CardContainer = props => {
	const { classes, icon, heading, subHeading } = props;

	return (
		<Paper className={classes.card}>
			<div style={{ flexDirection: "row", display: "flex" }}>
				{icon}

				<div>
					<Typography variant="headline" component="h3">
						{heading}
					</Typography>
					<Typography color="textSecondary">{subHeading}</Typography>
				</div>
			</div>
		</Paper>
	);
};

CardContainer.propTypes = {
	classes: PropTypes.object.isRequired,
	icon: PropTypes.element.isRequired,
	heading: PropTypes.string.isRequired,
	subHeading: PropTypes.string.isRequired
};

export default withStyles(styles)(CardContainer);
