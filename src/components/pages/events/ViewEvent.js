import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import { observer } from "mobx-react";

import Button from "../../common/Button";
import SocialButton from "../../common/social/SocialButton";
import Divider from "../../common/Divider";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import SupportingArtistsLabel from "./SupportingArtistsLabel";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	media: {
		height: 400,
		width: "100%",
		borderRadius: theme.shape.borderRadius
	},
	descriptionDiv: {
		marginTop: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	}
});

const ArtistDescription = props => {
	const {
		classes,
		name,
		bio,
		facebook_username,
		instagram_username,
		snapchat_username,
		soundcloud_username,
		twitter_username,
		website_url
	} = props;

	return (
		<div className={classes.descriptionDiv}>
			<Typography variant="subheading">{name}</Typography>

			{facebook_username ? (
				<SocialButton
					style={{ marginRight: 10 }}
					icon="facebook"
					href={`https://facebook.com/${facebook_username}`}
					size={35}
				/>
			) : null}

			{twitter_username ? (
				<SocialButton
					style={{ marginRight: 10 }}
					icon="twitter"
					href={`https://twitter.com/${twitter_username}`}
					size={35}
				/>
			) : null}

			{instagram_username ? (
				<SocialButton
					style={{ marginRight: 10 }}
					icon="instagram"
					href={`https://instagram.com/${instagram_username}`}
					size={35}
				/>
			) : null}

			{snapchat_username ? (
				<SocialButton
					style={{ marginRight: 10 }}
					icon="snapchat"
					href={`https://snapchat.com/${snapchat_username}`}
					size={35}
				/>
			) : null}

			{soundcloud_username ? (
				<SocialButton
					style={{ marginRight: 10 }}
					icon="soundcloud"
					href={`https://soundcloud.com/${soundcloud_username}`}
					size={35}
				/>
			) : null}

			{bio ? (
				<Typography style={{ marginTop: 20 }} variant="body1">
					{bio}
				</Typography>
			) : null}
		</div>
	);
};

@observer
class ViewEvent extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	renderArtists() {
		const { classes } = this.props;
		const { artists } = selectedEvent;
		if (!artists) {
			return null;
		}

		return artists.map((artist, index) => (
			<div key={index}>
				<ArtistDescription {...artist} classes={classes} />
				{artists.length > index + 1 ? <Divider /> : null}
			</div>
		));
	}

	render() {
		const { classes } = this.props;
		const { event, venue, artists, organization, id } = selectedEvent;

		if (event === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			age_limit,
			promo_image_url,
			displayDoorTime,
			displayShowTime
		} = event;

		return (
			<Paper className={classes.card}>
				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Typography variant="subheading">
							{displayEventStartDate}
						</Typography>
						<br />
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<Typography variant="caption">
							{organization.name} presents
						</Typography>

						<Typography variant="display3" component="h3">
							{name}
						</Typography>

						<Typography variant="display1" component="h3">
							<SupportingArtistsLabel artists={artists} />
						</Typography>

						<Typography variant="subheading">{venue.name}</Typography>
					</Grid>

					<Grid item xs={12} sm={8} lg={8}>
						<CardMedia
							className={classes.media}
							image={promo_image_url}
							title={name}
						/>

						<div className={classes.descriptionDiv}>
							<Typography variant="headline">Description</Typography>
							<Typography variant="body1">{additional_info}</Typography>
						</div>

						<Typography style={{ marginTop: 60 }} variant="headline">
							Artists
						</Typography>

						{this.renderArtists()}
					</Grid>
					<Grid item xs={12} sm={4} lg={4}>
						<Typography style={{ textAlign: "center" }} variant="headline">
							$10 - $50
						</Typography>

						<Link
							style={{ textDecoration: "none" }}
							to={`/events/${id}/tickets`}
						>
							<Button
								size="large"
								style={{ width: "100%" }}
								customClassName="callToAction"
							>
								Book now
							</Button>
						</Link>

						<div style={{ marginBottom: 30 }} />

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Date and time
						</Typography>

						<Typography variant="body1">{displayEventStartDate}</Typography>
						<Typography variant="body1">
							Doors: {displayDoorTime} / Show: {displayShowTime}
						</Typography>
						<Typography variant="body1">
							{age_limit
								? `This event is for over ${age_limit} year olds`
								: "This event is for all ages"}
						</Typography>

						<div style={{ marginBottom: 30 }} />

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Location
						</Typography>

						<Typography variant="body1">{venue.name}</Typography>
						<Typography variant="body1">{venue.address}</Typography>
						<a target="_blank" href={venue.googleMapsLink}>
							<Typography variant="body1">View map</Typography>
						</a>

						<div style={{ marginBottom: 30 }} />

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Share with your friends
						</Typography>

						<SocialButton
							style={{ marginRight: 10 }}
							icon="facebook"
							href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
								window.location.href
							)}`}
						/>
						<SocialButton
							icon="twitter"
							href={`https://twitter.com/home?status=${encodeURIComponent(
								window.location.href
							)}`}
						/>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

ViewEvent.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ViewEvent);
