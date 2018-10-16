import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Link } from "react-router-dom";

import notifications from "../../../../../stores/notifications";
import Button from "../../../../common/Button";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		display: "flex"
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto",
		display: "flex",
		flexDirection: "row"
	},
	cardContentInfo: {
		flex: 1
	},
	media: {
		width: "100%",
		maxWidth: 130,
		height: 130
	},
	actionButtons: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing.unit
	}
});

class GuestList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			guests: null
		};
	}

	componentDidMount() {
		const { match } = this.props;

		if (match && match.params && match.params.id) {
			let event_id = null;

			event_id = match.params.id;

			Bigneon()
				.events.guests.index({ event_id, query: "" })
				.then(response => {
					const { data, paging } = response.data; //@TODO Implement pagination
					this.setState({ guests: data });
				})
				.catch(error => {
					console.error(error);
					let message = "Loading guests failed.";
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
			//TODO 404
		}
	}

	renderGuests() {
		const { guests } = this.state;
		const { classes } = this.props;

		if (guests === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (guests && guests.length > 0) {
			return guests.map(guest => {
				const {
					id,
					email,
					first_name,
					last_name,
					redeem_key,
					status,
					ticket_type,
					user_id,
					thumb_profile_pic_url
				} = guest;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardMedia
								className={classes.media}
								image={
									thumb_profile_pic_url || "/images/profile-pic-placeholder.png"
								}
								title={name}
							/>

							<CardContent className={classes.cardContent}>
								<div className={classes.cardContentInfo}>
									<Typography variant="display1">
										{first_name} {last_name}
									</Typography>
									<Typography variant="headline">{email}</Typography>
								</div>

								<div className={classes.cardContentInfo}>
									<Typography variant="body1">
										Ticket: <b>{ticket_type}</b>
									</Typography>

									<Typography variant="body1">
										Status: <b>{status}</b>
									</Typography>
								</div>
							</CardContent>

							<div className={classes.actionButtons}>
								<Button customClassName="primary">Redeem ticket</Button>
							</div>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No guests yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Guests</Typography>

				<Grid container spacing={24}>
					{this.renderGuests()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(GuestList);
