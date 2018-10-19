import React from "react";
import PropTypes from "prop-types";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Button from "../../elements/Button";

const styles = theme => {
	return {
		container: {
			padding: theme.spacing.unit,
			height: "100%",
			display: "flex",
			flex: 1,
			flexDirection: "column"
		},
		detailsContainer: {
			flex: 1
		},
		mediaContainer: {
			flex: 2
		},
		promoImage: {
			height: "100%",
			width: "100%",
			borderRadius: theme.shape.borderRadius
		},
		actionButtonContainer: {
			flex: 1,
			display: "flex",
			flexDirection: "column",
			justifyContent: "flex-end",
			paddingBottom: 10,
			paddingTop: 10
		}
	};
};

const Default = props => {
	const { classes, event, venue, artists, organization, id, height } = props;

	const {
		name,
		displayEventStartDate,

		promo_image_url
	} = event;

	return (
		<div className={classes.container} style={{ height }}>
			<div className={classes.detailsContainer}>
				<Typography variant="subheading">{displayEventStartDate}</Typography>

				<Typography variant="display1" component="h4">
					{name}
				</Typography>

				<Typography variant="body1">{venue.name}</Typography>
				<Typography variant="body1">{venue.address}</Typography>
			</div>

			<div className={classes.mediaContainer}>
				<CardMedia
					className={classes.promoImage}
					image={promo_image_url}
					title={name}
				/>
			</div>

			<div className={classes.actionButtonContainer}>
				<Button
					href={`/events/${id}`}
					target="_blank"
					style={{ width: "100%" }}
					variant="primary"
				>
					Details
				</Button>

				<div style={{ marginTop: 10 }} />

				<Button
					href={`/events/${id}/tickets`}
					target="_blank"
					style={{ width: "100%" }}
					variant="callToAction"
				>
					Buy tickets
				</Button>
			</div>
		</div>
	);
};

Default.propTypes = {
	classes: PropTypes.object.isRequired,
	height: PropTypes.number.isRequired,
	id: PropTypes.string.isRequired,
	event: PropTypes.object.isRequired,
	venue: PropTypes.object.isRequired,
	artists: PropTypes.array.isRequired,
	organization: PropTypes.object.isRequired
};

export default withStyles(styles)(Default);
