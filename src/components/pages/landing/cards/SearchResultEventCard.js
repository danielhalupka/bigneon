import React from "react";
import { Typography, withStyles } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import { Link } from "react-router-dom";

import PropTypes from "prop-types";
import Button from "../../../elements/Button";

const styles = theme => ({
	card: {
		maxWidth: 400
	},
	media: {
		height: 0,
		paddingTop: "56.25%"
	}
});

const SearchResultEventCard = ({
	classes,
	imgSrc,
	name,
	formattedEventDate,
	city,
	state
}) => {
	// const { id, imgSrc, name, additional_info, eventDate } = event;
	// const { city, state } = venue;

	return (
		<Card className={classes.card}>
			<CardMedia className={classes.media} image={imgSrc} title={name} />
			<CardContent>
				<Typography variant="caption">{formattedEventDate}</Typography>
				<br />
				<Typography variant="headline">{name}</Typography>

				<Typography variant="subheading">{`${city}${
					city ? ", " : ""
				}${state}`}</Typography>
			</CardContent>
			{/* <CardActions>
				<Link to={`/events/${id}`}>
					<Button style={{ marginRight: 4 }} variant="primary">
						Details
					</Button>
				</Link>

				<Link to={`/events/${id}/tickets`}>
					<Button variant="callToAction">Book now</Button>
				</Link>
			</CardActions> */}
		</Card>
	);
};

SearchResultEventCard.propTypes = {
	imgSrc: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	formattedEventDate: PropTypes.string.isRequired,
	city: PropTypes.string.isRequired,
	state: PropTypes.string.isRequired
};

export default withStyles(styles)(SearchResultEventCard);
