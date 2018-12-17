import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
	Typography,
	withStyles,
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
import moment from "moment";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import StyledLink from "../../../elements/StyledLink";
import CancelEventDialog from "./CancelEventDialog";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import EventSummaryCard from "./EventSummaryCard";
import user from "../../../../stores/user";
import Card from "../../../elements/Card";

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
		padding: theme.spacing.unit
	},

	rightHeaderOptions: {
		display: "flex",
		justifyContent: "flex-end",
		alignContent: "center"
	},
	innerCard: {
		padding: theme.spacing.unit * 2.5
	},
	headerContainer: {},
	menuContainer: {
		display: "flex",
		padding: theme.spacing.unit
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	}
});

class EventsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			events: null,
			cancelEventId: null,
			optionsAnchorEl: null,
			upcomingOrPast: this.props.match.params.upcomingOrPast || "upcoming"
		};

		this.expandCardDetails = this.expandCardDetails.bind(this);
	}

	componentDidUpdate() {
		let { upcomingOrPast } = this.state;
		if (
			upcomingOrPast !== (this.props.match.params.upcomingOrPast || "upcoming")
		) {
			this.setState(
				{
					upcomingOrPast: this.props.match.params.upcomingOrPast || "upcoming"
				},
				() => this.updateEvents()
			);
		}
	}

	componentDidMount() {
		this.updateEvents();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	handleMenuClick = event => {
		this.setState({ optionsAnchorEl: event.currentTarget });
	};

	handleOptionsClose = () => {
		this.setState({ optionsAnchorEl: null });
	};

	updateEvents() {
		//A bit of a hack, we might not have set the current org ID yet for this admin so keep checking
		if (!user.currentOrganizationId) {
			this.timeout = setTimeout(this.updateEvents.bind(this), 100);
			return;
		}

		this.setState({ events: null }, () => {
			let { upcomingOrPast } = this.state;
			Bigneon()
				.organizations.events.index({
					organization_id: user.currentOrganizationId,
					past_or_upcoming: upcomingOrPast
				})
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
								`/admin/events/${this.eventMenuSelected}/dashboard/holds`
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
							cancelled={!!cancelled_at}
							id={id}
							imageUrl={promo_image_url}
							name={name}
							venueName={venue.name || "Unknown Venue"}
							eventDate={moment
								.utc(event.event_start)
								.format("dddd, MMMM Do YYYY")}
							menuButton={MenuButton}
							isPublished={moment.utc(event.publish_date) < moment.utc()}
							isOnSale={moment.utc(event.on_sale) < moment.utc()}
							totalSold={event.sold_held + event.sold_unreserved}
							totalOpen={event.tickets_open}
							totalHeld={event.tickets_held}
							totalCapacity={event.total_tickets}
							totalSales={Math.floor(event.sales_total_in_cents / 100)}
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
		const { cancelEventId, upcomingOrPast } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<CancelEventDialog
					id={cancelEventId}
					onClose={() =>
						this.setState({ cancelEventId: null }, this.updateEvents.bind(this))
					}
				/>

				<Grid container spacing={16}>
					<Grid item xs={6} sm={6} lg={6}>
						<PageHeading iconUrl="/icons/events-multi.svg">Events</PageHeading>
					</Grid>
					<Grid
						item
						xs={6}
						sm={6}
						lg={6}
						style={{
							display: "flex",
							justifyContent: "flex-end"
						}}
					>
						<div className={classes.actionButtons}>
							<Link to={"/admin/events/create"}>
								<Button variant="callToAction">New event</Button>
							</Link>
						</div>
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<Card style={{ borderRadius: "6px 6px 0 0" }}>
							<div className={classes.innerCard}>
								<div className={classes.headerContainer}>
									<div className={classes.menuContainer}>
										<Typography className={classes.menuText}>
											<StyledLink
												underlined={upcomingOrPast === "upcoming"}
												to={`/admin/events/upcoming`}
											>
												Upcoming
											</StyledLink>
										</Typography>

										<Typography className={classes.menuText}>
											<StyledLink
												underlined={upcomingOrPast === "past"}
												to={`/admin/events/past`}
											>
												Past
											</StyledLink>
										</Typography>
									</div>
								</div>
							</div>
						</Card>
					</Grid>

					{this.renderEvents()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(EventsList);
