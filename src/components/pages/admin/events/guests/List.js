import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Link } from "react-router-dom";

import RedeemTicketDialog from "./RedeemTicketDialog";
import notifications from "../../../../../stores/notifications";
import Button from "../../../../elements/Button";
import Bigneon from "../../../../../helpers/bigneon";
import PageHeading from "../../../../elements/PageHeading";

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
			guestTickets: null,
			selectedTicket: null
		};
	}

	componentDidMount() {
		const { match } = this.props;

		if (match && match.params && match.params.id) {
			this.eventId = match.params.id;
			this.refreshGuests();
		} else {
			//TODO 404
		}
	}

	refreshGuests() {
		if (this.eventId) {
			Bigneon()
				.events.guests.index({ event_id: this.eventId, query: "" })
				.then(response => {
					const { data, paging } = response.data; //@TODO Implement pagination
					this.setState({ guestTickets: data });
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
		}
	}

	renderGuests() {
		const { guestTickets } = this.state;
		const { classes } = this.props;

		if (guestTickets === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (guestTickets && guestTickets.length > 0) {
			return guestTickets.map(ticket => {
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
				} = ticket;

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
								<Button
									disabled={status === "Redeemed"}
									onClick={() => this.setState({ selectedTicket: ticket })}
									variant="primary"
								>
									Redeem ticket
								</Button>
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
		const { selectedTicket } = this.state;
		return (
			<div>
				<RedeemTicketDialog
					ticket={selectedTicket}
					onClose={() =>
						this.setState(
							{ selectedTicket: null },
							this.refreshGuests.bind(this)
						)
					}
				/>
				<PageHeading>Guest list</PageHeading>
				<Typography variant="subheading">Event name</Typography>
				<br />
				<Grid container spacing={24}>
					{this.renderGuests()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(GuestList);
