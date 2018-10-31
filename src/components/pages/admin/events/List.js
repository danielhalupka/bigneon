import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
	Typography,
	withStyles,
	CardMedia,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import EditIcon from "@material-ui/icons/Edit";
import ViewIcon from "@material-ui/icons/Link";
import GuestListIcon from "@material-ui/icons/People";
import CancelIcon from "@material-ui/icons/Cancel";
import CreateWidgetIcon from "@material-ui/icons/Code";
import TicketHoldsIcon from "@material-ui/icons/List";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import CancelEventDialog from "./CancelEventDialog";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";

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
		maxWidth: 350,
		height: 240
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
			cancelEventId: null,
			optionsAnchorEl: null
		};
	}

	componentDidMount() {
		this.updateEvents();
	}

	handleMenuClick = event => {
		this.setState({ optionsAnchorEl: event.currentTarget });
	};

	handleOptionsClose = () => {
		this.setState({ optionsAnchorEl: null });
	};

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
										events: [...previousEvents, ...eventResponse.data.data] //@TODO Implement pagination
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

		const { optionsAnchorEl } = this.state;

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
				const eventOptions = [
					{
						text: "Edit event",
						onClick: () =>
							this.props.history.push(
								`/admin/events/${this.eventMenuSelected}/edit`
							),
						MenuOptionIcon: EditIcon
					},
					{
						text: "Ticket holds",
						onClick: () =>
							this.props.history.push(
								`/admin/events/${this.eventMenuSelected}/holds`
							),
						MenuOptionIcon: TicketHoldsIcon
					},
					{
						text: "View event",
						onClick: () =>
							this.props.history.push(`/events/${this.eventMenuSelected}`),
						MenuOptionIcon: ViewIcon
					},
					{
						text: "Guest list",
						onClick: () =>
							this.props.history.push(
								`/admin/events/${this.eventMenuSelected}/guests`
							),
						MenuOptionIcon: GuestListIcon
					},
					{
						text: "Cancel event",
						onClick: () =>
							this.setState({ cancelEventId: this.eventMenuSelected }),
						MenuOptionIcon: CancelIcon
					},
					{
						text: "Create widget",
						onClick: () =>
							this.props.history.push(
								`/admin/widget-builder/${this.eventMenuSelected}`
							),
						MenuOptionIcon: CreateWidgetIcon
					}
				];

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
									{venue && venue.address ? venue.address : ""}
								</Typography>
							</CardContent>

							<div>
								<IconButton
									onClick={e => {
										this.eventMenuSelected = id;
										this.handleMenuClick(e);
									}}
								>
									<MoreHorizIcon />
								</IconButton>

								<Menu
									id="long-menu"
									anchorEl={optionsAnchorEl}
									open={Boolean(optionsAnchorEl)}
									onClose={this.handleOptionsClose}
								>
									{eventOptions.map(({ text, onClick, MenuOptionIcon }) => {
										return (
											<MenuItem
												key={text}
												onClick={() => {
													this.handleOptionsClose();
													onClick();
												}}
											>
												<ListItemIcon>
													<MenuOptionIcon />
												</ListItemIcon>
												<ListItemText inset primary={text} />
											</MenuItem>
										);
									})}
								</Menu>
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

				<PageHeading iconUrl="/icons/events-active.svg">Events</PageHeading>

				<Grid container spacing={16}>
					<Grid item xs={12} sm={12} lg={12}>
						<Link to={"/admin/events/create"}>
							<Button variant="callToAction">Create event</Button>
						</Link>
					</Grid>

					{this.renderEvents()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(EventsList);
