import React from "react";
import { Typography, withStyles } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";

import PropTypes from "prop-types";
import Button from "../../../common/Button";

const styles = theme => ({
	card: {
		maxWidth: 345
	},
	media: {
		height: 0,
		paddingTop: "56.25%"
	}
});

const EventCard = ({ classes, imgSrc, title, description }) => {
	return (
		<Card className={classes.card}>
			<CardMedia className={classes.media} image={imgSrc} title={title} />
			<CardContent>
				<Typography gutterBottom variant="headline" component="h2">
					{title}
				</Typography>
				<Typography component="p">{description}</Typography>
			</CardContent>
			<CardActions>
				<Button style={{ marginRight: 4 }} customClassName="primary">
					Details
				</Button>

				<Button customClassName="callToAction">Book now</Button>
			</CardActions>
		</Card>
	);
};

EventCard.propTypes = {
	imgSrc: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired
};

export default withStyles(styles)(EventCard);
