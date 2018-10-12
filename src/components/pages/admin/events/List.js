import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Link } from "react-router-dom";

import notifications from "../../../../stores/notifications";
import Button from "../../../common/Button";
import CancelEventDialog from "./CancelEventDialog";
import Bigneon from "../../../../helpers/bigneon";

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

class EventsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			events: null,
			cancelEventId: null
		};
	}

	componentDidMount() {
		this.updateEvents();
	}

	updateEvents() {
		this.setState({ events: null }, () => {
			//TODO remove this temp fix of iterating through orgs this user belongs to.
			//When a user can choose which org they're dealing with currently
			//https://github.com/big-neon/bn-web/issues/237
			Bigneon()
				.organizations.index()
				.then(response => {
					const { data, paging } = response.data; //@TODO Implement pagination
					data.forEach(({ id }) => {
						Bigneon()
							.organizations.events.index({ organization_id: id })
							.then(eventResponse => {
								//Append all events together
								this.setState(({ events }) => {
									const previousEvents = events ? events : [];
									return {
										events: [...previousEvents, ...eventResponse.data]
									};
								});
							})
							.catch(error => {
								console.error(error);

								let message = "Loading events failed.";
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
					});
				})
				.catch(error => {
					console.error(error);

					let message = "Loading organizations failed.";
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
		});
	}

	renderEvents() {
		const { events } = this.state;
		const { classes } = this.props;

		if (events === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (events && events.length > 0) {
			return events.map(eventData => {
				const { venue, ...event } = eventData;
				const { id, name, promo_image_url, cancelled_at } = event;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardMedia
								className={classes.media}
								image={promo_image_url || "/images/event-placeholder.png"}
								title={name}
							/>

							<CardContent className={classes.cardContent}>
								<Typography variant="display1">
									{name} {cancelled_at ? "(Cancelled)" : ""}
								</Typography>
								<Typography variant="body1">
									{venue && venue.address ? venue.address : "*Missing address"}
								</Typography>
							</CardContent>

							<div className={classes.actionButtons}>
								{!cancelled_at ? (
									<Button
										onClick={() => this.setState({ cancelEventId: id })}
										customClassName="warning"
										style={{ marginRight: 10 }}
									>
										Cancel event
									</Button>
								) : null}
								<Link
									to={`/admin/events/${id}`}
									style={{ textDecoration: "none", marginRight: 10 }}
								>
									<Button customClassName="primary">Edit details</Button>
								</Link>
								{!cancelled_at ? (
									<Button
										target="_blank"
										href={`/events/${id}`}
										customClassName="primary"
										style={{ marginRight: 10 }}
									>
										Open event page
									</Button>
								) : null}
								{!cancelled_at ? (
									<Link
										to={`/admin/widget-builder/${id}`}
										style={{ textDecoration: "none", marginRight: 10 }}
									>
										<Button customClassName="primary">Create widget</Button>
									</Link>
								) : null}
							</div>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No events yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		const { cancelEventId } = this.state;

		return (
			<div>
				<CancelEventDialog
					id={cancelEventId}
					onClose={() =>
						this.setState({ cancelEventId: null }, this.updateEvents.bind(this))
					}
				/>
				<Typography variant="display3">Events</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Link
							to={"/admin/events/create"}
							style={{ textDecoration: "none" }}
						>
							<Button customClassName="callToAction">Create event</Button>
						</Link>
					</Grid>

					{this.renderEvents()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(EventsList);
