import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import { Link } from "react-router-dom";

import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import Button from "../../../common/Button";

const styles = theme => ({
	paper: {},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit
	}
});

class EventsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			events: null
		};
	}

	componentDidMount() {
		api()
			.get("/events")
			.then(response => {
				const { data } = response;
				this.setState({ events: data });
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
				const { id, name } = event;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardContent className={classes.cardContent}>
								<Typography variant="display1">{name}</Typography>
								<Typography variant="body1">
									{venue.address || "*Missing address"}
								</Typography>
							</CardContent>

							<CardActions>
								<Link
									to={`/admin/events/${id}`}
									style={{ textDecoration: "none" }}
								>
									<Button customClassName="primary">Edit details</Button>
								</Link>
								<Link to={`/events/${id}`} style={{ textDecoration: "none" }}>
									<Button customClassName="secondary">View more</Button>
								</Link>
							</CardActions>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No events yet</Typography>
					<Link to={"/admin/events/create"} style={{ textDecoration: "none" }}>
						<Button customClassName="callToAction">Create event</Button>
					</Link>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Events</Typography>

				<Grid container spacing={24}>
					{this.renderEvents()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(EventsList);
