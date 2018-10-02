import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
	Typography,
	withStyles,
	Grid,
	Card,
	CardContent,
	CardMedia
} from "@material-ui/core";
import moment from "moment";

import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";
import Button from "../../common/Button";
import TicketDialog from "./TicketDialog";

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
		maxWidth: 300,
		height: 180
	},
	actionButtons: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing.unit
	}
});

class TicketList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ticketGroups: null
		};
	}

	componentDidMount() {
		Bigneon()
			.tickets.index()
			.then(response => {
				const { data } = response;
				let ticketGroups = [];

				//TODO api data structure will eventually change
				data.forEach(ticketGroup => {
					const event = ticketGroup[0];
					const tickets = ticketGroup[1];

					event.formattedData = moment(
						event.event_start,
						moment.HTML5_FMT.DATETIME_LOCAL_MS
					).format("dddd, MMM D");

					ticketGroups.push({ event, tickets });
				});

				this.setState({ ticketGroups });
			})
			.catch(error => {
				console.error(error);
				let message = "Loading tickets failed.";
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

	renderTickets() {
		const { ticketGroups } = this.state;
		const { classes } = this.props;

		if (ticketGroups === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (ticketGroups && ticketGroups.length > 0) {
			return ticketGroups.map(ticketGroup => {
				const { event, tickets } = ticketGroup;
				const { id, promo_image_url, formattedData, name, venue } = event;
				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardMedia
								className={classes.media}
								image={promo_image_url || "/images/event-placeholder.png"}
								title={name}
							/>

							<CardContent className={classes.cardContent}>
								<Grid container spacing={24}>
									<Grid item xs={12} sm={12} lg={12}>
										<Typography component="h2" variant="headline">
											{name}
										</Typography>
										<Typography variant="subheading">
											{formattedData}
										</Typography>
										<Typography variant="subheading">
											{venue.address}
										</Typography>
									</Grid>

									{/* <Grid item xs={12} sm={12} lg={4}>
										<Typography variant="title">Tickets</Typography>
										{tickets.map(({ id, ticket_type_name }) => (
											<Typography key={id} variant="body1">
												{ticket_type_name}
											</Typography>
										))}
									</Grid> */}
								</Grid>
							</CardContent>

							<div className={classes.actionButtons}>
								<Button
									style={{ marginRight: 10 }}
									customClassName="primary"
									onClick={() =>
										this.setState({
											selectedTickets: tickets,
											selectedEventName: name
										})
									}
								>
									View tickets
								</Button>
								<Button
									target="_blank"
									href={`/events/${id}`}
									customClassName="secondary"
								>
									View event
								</Button>
							</div>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No tickets yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		const { selectedTickets, selectedEventName } = this.state;
		return (
			<div>
				<Typography variant="display3">My tickets</Typography>
				<TicketDialog
					open={!!selectedTickets}
					eventName={selectedEventName}
					tickets={selectedTickets}
					onClose={() => this.setState({ selectedTickets: null })}
				/>
				<Grid container spacing={24}>
					{this.renderTickets()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(TicketList);
