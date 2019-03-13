//TODO decommission this component
import React from "react";
import { Typography, withStyles, CardMedia, Grid } from "@material-ui/core";
import PropTypes from "prop-types";
import Divider from "../../common/Divider";
import SupportingArtistsLabel from "./SupportingArtistsLabel";

const styles = theme => ({
	descriptionDiv: {
		marginTop: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	},
	media: {
		height: 300,
		width: "100%",
		borderRadius: theme.shape.borderRadius
	}
});

const EventSummaryGrid = ({ classes, event, venue, organization, artists }) => {
	const {
		displayEventStartDate,
		name,
		displayDoorTime,
		displayShowTime,
		age_limit,
		additional_info,
		promo_image_url
	} = event;

	return (
		<Grid container spacing={24}>
			<Grid item xs={12} sm={8} lg={8}>
				<Typography variant="caption">{organization.name} presents</Typography>

				<Typography variant="display3" component="h3">
					{name}
				</Typography>

				<Typography variant="display1" component="h3">
					<SupportingArtistsLabel artists={artists}/>
				</Typography>

				<Typography style={{ marginBottom: 20 }} variant="subheading">
					Date and time
				</Typography>

				<Typography variant="body1">{displayEventStartDate}</Typography>
				<Typography variant="body1">
					Doors: {displayDoorTime} / Show: {displayShowTime}
				</Typography>
				<Typography variant="body1">
					{age_limit
						? `This event is ${age_limit}+`
						: "This event is all ages"}
				</Typography>

				<div style={{ marginBottom: 30 }}/>

				<div className={classes.descriptionDiv}>
					<Typography variant="headline">Description</Typography>
					<Typography variant="body1">{additional_info}</Typography>
				</div>
			</Grid>

			<Grid item xs={12} sm={4} lg={4}>
				<CardMedia
					className={classes.media}
					image={promo_image_url}
					title={name}
				/>
			</Grid>

			<Divider/>
		</Grid>
	);
};

EventSummaryGrid.propTypes = {
	classes: PropTypes.object.isRequired,
	event: PropTypes.object.isRequired,
	venue: PropTypes.object.isRequired,
	artists: PropTypes.array.isRequired,
	organization: PropTypes.object.isRequired
};

export default withStyles(styles)(EventSummaryGrid);
