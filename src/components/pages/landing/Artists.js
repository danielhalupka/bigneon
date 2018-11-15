import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Link } from "react-router-dom";

import notifications from "../../../stores/notifications";
import Button from "../../elements/Button";
import Bigneon from "../../../helpers/bigneon";
import PageHeading from "../../elements/PageHeading";
import layout from "../../../stores/layout";

const styles = theme => ({
	paper: {
		display: "flex"
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	media: {
		width: "100%",
		maxWidth: 150,
		height: 150
	},
	actionButtons: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing.unit
	}
});

class ArtistsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artists: null
		};
	}

	componentDidMount() {
		layout.toggleSideMenu(false);
		Bigneon()
			.artists.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ artists: data });
			})
			.catch(error => {
				console.error(error);

				let message = "Loading artists failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	renderArtists() {
		const { artists } = this.state;
		const { classes } = this.props;

		if (artists === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (artists && artists.length > 0) {
			return artists.map(artist => {
				const {
					id,
					name,
					youtube_video_urls,
					website_url,
					thumb_image_url
				} = artist;
				const videoCount = youtube_video_urls ? youtube_video_urls.length : 0;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardMedia
								className={classes.media}
								image={thumb_image_url || "/images/profile-pic-placeholder.png"}
								title={name}
							/>

							<CardContent className={classes.cardContent}>
								<Typography variant="display1">{name}</Typography>
								<Typography variant="body1">
									{videoCount} video
									{videoCount === 1 ? "" : "s"}
								</Typography>

								<a href={website_url} target="_blank">
									<Typography variant="body1">{website_url}</Typography>
								</a>
							</CardContent>

							<div className={classes.actionButtons}>
								{/* <Link
									to={`/admin/artists/${id}`}
									style={{ marginRight: 10 }}
								>
									<Button variant="primary">Edit details</Button>
								</Link> */}
								<Link to={`/artists/${id}`}>
									<Button variant="secondary">View more</Button>
								</Link>
							</div>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No artists yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<PageHeading iconUrl="/icons/artists-active.svg">Artists</PageHeading>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{/* <Link
							to={"/admin/artists/create"}
						>
							<Button variant="callToAction">Create artist</Button>
						</Link> */}
					</Grid>

					{this.renderArtists()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(ArtistsList);
