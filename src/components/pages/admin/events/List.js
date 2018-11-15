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
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DashboardIcon from "@material-ui/icons/Dashboard";
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
import EventSummaryCard from "./EventSummaryCard";
import layout from "../../../../stores/layout";

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

		this.expandCardDetails = this.expandCardDetails.bind(this);
	}

	componentDidMount() {
		layout.toggleSideMenu(true);
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
								console.log("error with id: ", id);

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

	expandCardDetails(expandedCardId) {
		this.setState({ expandedCardId });
	}

	renderEvents() {
		const { events, expandedCardId } = this.state;
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
						text: "Dashboard",
						onClick: () =>
							this.props.history.push(
								`/admin/events/${this.eventMenuSelected}/dashboard`
							),
						MenuOptionIcon: DashboardIcon
					},
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

				const MenuButton = (
					<div>
						<IconButton
							onClick={e => {
								this.eventMenuSelected = id;
								this.handleMenuClick(e);
							}}
						>
							<MoreHorizIcon fontSize={"large"} nativeColor="#9da3b4" />
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
				);

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<EventSummaryCard
							id={id}
							imageUrl={promo_image_url}
							name={name}
							eventDate={event.event_start }//.format("DDD M/d/yy. h:mm PM Z")}
							menuButton={MenuButton}
							isPublished={true}
							isOnSale={true}
							totalSold={event.sold_held+event.sold_unreserved}
							totalOpen={event.tickets_open}
							totalHeld={event.tickets_held}
							totalCapacity={event.total_tickets}
							totalSales={event.sales_total_in_cents}
							isExpanded={expandedCardId === id}
							onExpandClick={this.expandCardDetails}
							ticketTypes={event.ticket_types}
						/>
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

				<Grid container spacing={16}>
					<Grid item xs={12} sm={12} lg={6}>
						<PageHeading iconUrl="/icons/events-multi.svg">Events</PageHeading>
					</Grid>
					<Grid
						item
						xs={12}
						sm={12}
						lg={6}
						style={{
							display: "flex",
							justifyContent: "flex-end"
						}}
					>
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
