import React from "react";
import { Typography, withStyles, CardMedia, Grid } from "@material-ui/core";
import PropTypes from "prop-types";
import Divider from "../../common/Divider";

const styles = theme => ({
	descriptionDiv: {
		marginTop: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	},
	media: {
		height: 200,
		width: "100%",
		borderRadius: theme.shape.borderRadius
	}
});

const EventSummaryGrid = ({ classes, name, displayEventStartDate }) => {
	return (
		<Grid container spacing={24}>
			<Grid item xs={12} sm={8} lg={8}>
				<Typography variant="caption">Organization name presents</Typography>

				<Typography variant="display3" component="h3">
					{name}
				</Typography>

				<Typography variant="display1" component="h3">
					With supporting artists, artist 1 and artist 2
				</Typography>

				<Typography style={{ marginBottom: 20 }} variant="subheading">
					Date and time
				</Typography>

				<Typography variant="body1">{displayEventStartDate}</Typography>
				<Typography variant="body1">Doors: 8:00PM / Show: 9:00PM</Typography>
				<Typography variant="body1">This event is all ages</Typography>

				<div style={{ marginBottom: 30 }} />

				<div className={classes.descriptionDiv}>
					<Typography variant="headline">Description</Typography>
					<Typography variant="body1">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
						eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
						ad minim veniam.
					</Typography>
				</div>
			</Grid>

			<Grid item xs={12} sm={4} lg={4}>
				<CardMedia
					className={classes.media}
					image={`https://picsum.photos/800/400/?image=200`}
					title={name}
				/>
			</Grid>

			<Divider />
		</Grid>
	);
};

EventSummaryGrid.propTypes = {
	classes: PropTypes.object.isRequired,
	name: PropTypes.string.isRequired,
	displayEventStartDate: PropTypes.string
};

export default withStyles(styles)(EventSummaryGrid);
