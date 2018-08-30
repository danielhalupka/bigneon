import React from "react";
import { Typography, withStyles } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import { Link } from "react-router-dom";

import PropTypes from "prop-types";
import Button from "../../../common/Button";

const styles = theme => ({
	card: {
		maxWidth: 400
	},
	media: {
		height: 0,
		paddingTop: "56.25%"
	}
});

const SearchResultEventCard = ({ classes, event, venue }) => {
	const { id, imgSrc, name, description } = event;

	return (
		<Card className={classes.card}>
			<CardMedia className={classes.media} image={imgSrc} title={name} />
			<CardContent>
				<Typography gutterBottom variant="headline" component="h2">
					{name}
				</Typography>
				<Typography component="p">{description}</Typography>
			</CardContent>
			<CardActions>
				<Link style={{ textDecoration: "none" }} to={`/events/${id}`}>
					<Button style={{ marginRight: 4 }} customClassName="primary">
						Details
					</Button>
				</Link>

				<Link style={{ textDecoration: "none" }} to={`/events/${id}/tickets`}>
					<Button customClassName="callToAction">Book now</Button>
				</Link>
			</CardActions>
		</Card>
	);
};

SearchResultEventCard.propTypes = {
	event: PropTypes.object.isRequired,
	venue: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchResultEventCard);
