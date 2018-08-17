import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import moment from "moment";

import Button from "../../common/Button";
import SocialButton from "../../common/social/SocialButton";
import Divider from "../../common/Divider";
import api from "../../../helpers/api";
import notifications from "../../../stores/notifications";

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

const ArtistDescription = ({ classes }) => {
	return (
		<div className={classes.descriptionDiv}>
			<Typography variant="subheading">Artist name</Typography>

			<SocialButton
				style={{ marginRight: 10 }}
				icon="facebook"
				onClick={() => console.log("View on Facebook")}
				size={35}
			/>
			<SocialButton
				icon="twitter"
				onClick={() => console.log("View on Twitter")}
				size={35}
			/>

			<Typography style={{ marginTop: 20 }} variant="body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
				tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
				veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
				commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
				velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
				occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</Typography>
		</div>
	);
};

class ViewEvent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loadedEvent: null,
			name: "",
			displayEventStartDate: null
		};
	}

	componentDidMount() {
		let eventId = null;
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			eventId = this.props.match.params.id;

			api({ auth: false }) //TODO must be false
				.get(`/events/${eventId}`)
				.then(response => {
					const {
						name,
						created_at,
						event_start,
						organization_id,
						ticket_sell_date,
						venue_id
					} = response.data;

					const displayEventStartDate = moment(event_start).format(
						"dddd, MMMM Do YYYY"
					);

					this.setState({
						name,
						displayEventStartDate,
						loadedEvent: true
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false, loadedEvent: false });

					let message = "Loading event details failed.";
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
		} else {
			//TODO return 404
		}
	}

	render() {
		const { classes } = this.props;
		const { name, displayEventStartDate, loadedEvent } = this.state;

		if (loadedEvent === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (loadedEvent === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

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
							Organization name presents
						</Typography>

						<Typography variant="display3" component="h3">
							{name}
						</Typography>

						<Typography variant="display1" component="h3">
							With supporting artists, artist 1 and artist 2
						</Typography>

						<Typography variant="subheading">Venue name</Typography>
					</Grid>

					<Grid item xs={12} sm={8} lg={8}>
						<CardMedia
							className={classes.media}
							image={`https://picsum.photos/800/400/?image=200`}
							title={name}
						/>

						<div className={classes.descriptionDiv}>
							<Typography variant="headline">Description</Typography>
							<Typography variant="body1">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
								enim ad minim veniam, quis nostrud exercitation ullamco laboris
								nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
								in reprehenderit in voluptate velit esse cillum dolore eu fugiat
								nulla pariatur. Excepteur sint occaecat cupidatat non proident,
								sunt in culpa qui officia deserunt mollit anim id est laborum.
								<br />
								<br />
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
								enim ad minim veniam, quis nostrud exercitation ullamco laboris
								nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
								in reprehenderit in voluptate velit esse cillum dolore eu fugiat
								nulla pariatur. Excepteur sint occaecat cupidatat non proident,
								sunt in culpa qui officia deserunt mollit anim id est laborum.
							</Typography>
						</div>

						<Typography style={{ marginTop: 60 }} variant="headline">
							Artists
						</Typography>

						<ArtistDescription classes={classes} />
						<Divider />
						<ArtistDescription classes={classes} />
					</Grid>
					<Grid item xs={12} sm={4} lg={4}>
						<Typography style={{ textAlign: "center" }} variant="headline">
							$10 - $50
						</Typography>

						<Button
							size="large"
							style={{ width: "100%" }}
							customClassName="callToAction"
						>
							Book now
						</Button>

						<div style={{ marginBottom: 30 }} />

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Date and time
						</Typography>

						<Typography variant="body1">{displayEventStartDate}</Typography>
						<Typography variant="body1">
							Doors: 8:00PM / Show: 9:00PM
						</Typography>
						<Typography variant="body1">This event is all ages</Typography>

						<div style={{ marginBottom: 30 }} />

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Location
						</Typography>

						<Typography variant="body1">Venue name</Typography>
						<Typography variant="body1">123 Street, San Francisco</Typography>
						<a target="_blank" href="https://google.com/maps">
							<Typography variant="body1">View map</Typography>
						</a>

						<div style={{ marginBottom: 30 }} />

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Share with your friends
						</Typography>

						<SocialButton
							style={{ marginRight: 10 }}
							icon="facebook"
							onClick={() => console.log("Share to Facebook")}
						/>
						<SocialButton
							icon="twitter"
							onClick={() => console.log("Share to Twitter")}
						/>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

export default withStyles(styles)(ViewEvent);
