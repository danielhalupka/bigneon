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
import CancelIcon from "@material-ui/icons/Cancel";
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
import Loader from "../../../elements/loaders/Loader";

const styles = theme => ({
	paper: {
		display: "flex"
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	actionButtons: {
		padding: theme.spacing.unit
	},
	rightHeaderOptions: {
		display: "flex",
		justifyContent: "flex-end",
		alignContent: "center"
	},
	menuContainer: {
		display: "flex",
		padding: theme.spacing.unit * 2.5
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
		const { upcomingOrPast } = this.state;
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
			const { upcomingOrPast } = this.state;
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

					notifications.showFromErrorResponse({
						defaultMessage: "Loading events failed.",
						error
					});
				});
		});
	}

	expandCardDetails(expandedCardId) {
		this.setState({ expandedCardId });
	}

	renderEvents() {
		const { events, expandedCardId, upcomingOrPast } = this.state;
		const eventEnded = upcomingOrPast === "past";

		const { optionsAnchorEl } = this.state;

		if (events === null) {
			return <Loader/>;
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
						disabled: eventEnded || !user.isOrgMember,
						onClick: () =>
							this.props.history.push(
								`/admin/events/${this.eventMenuSelected}/edit`
							),
						MenuOptionIcon: EditIcon
					},
					{
						text: "View event",
						onClick: () =>
							this.props.history.push(`/events/${this.eventMenuSelected}`),
						MenuOptionIcon: ViewIcon
					},
					{
						text: "Cancel event",
						disabled: !user.isOrgMember,
						onClick: () =>
							this.setState({ cancelEventId: this.eventMenuSelected }),
						MenuOptionIcon: CancelIcon
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
							<MoreHorizIcon fontSize={"large"} nativeColor="#9da3b4"/>
						</IconButton>

						<Menu
							id="long-menu"
							anchorEl={optionsAnchorEl}
							open={Boolean(optionsAnchorEl)}
							onClose={this.handleOptionsClose}
						>
							{eventOptions.map(
								({ text, onClick, MenuOptionIcon, disabled }) => {
									return (
										<MenuItem
											key={text}
											onClick={() => {
												this.handleOptionsClose();
												onClick();
											}}
											disabled={disabled}
										>
											<ListItemIcon>
												<MenuOptionIcon/>
											</ListItemIcon>
											<ListItemText inset primary={text}/>
										</MenuItem>
									);
								}
							)}
						</Menu>
					</div>
				);
				const { timezone } = venue;

				const isPublished = moment.utc(event.publish_date) < moment.utc();
				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<EventSummaryCard
							cancelled={!!cancelled_at}
							id={id}
							imageUrl={promo_image_url}
							name={name}
							isExternal={event.is_external}
							venueName={venue.name || "Unknown Venue"}
							eventDate={moment.utc(event.event_start).local()}
							menuButton={MenuButton}
							isPublished={isPublished}
							isOnSale={isPublished && moment.utc(event.on_sale) < moment.utc()}
							totalSold={event.sold_held + event.sold_unreserved}
							totalOpen={event.tickets_open}
							totalHeld={event.tickets_held}
							totalCapacity={event.total_tickets}
							totalSalesInCents={event.sales_total_in_cents}
							isExpanded={expandedCardId === id}
							onExpandClick={this.expandCardDetails}
							ticketTypes={event.ticket_types}
							venueTimezone={timezone}
							eventEnded={eventEnded}
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

				<Grid container spacing={0} alignItems="center">
					<Grid item xs={6} sm={6} lg={6}>
						<PageHeading iconUrl="/icons/events-multi.svg">
							Dashboard
						</PageHeading>
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
						{user.isOrgMember ? (
							<div className={classes.actionButtons}>
								<Link to={"/admin/events/create"}>
									<Button variant="callToAction">New event</Button>
								</Link>
							</div>
						) : (
							<div/>
						)}
					</Grid>
				</Grid>

				<Grid container spacing={16}>
					<Grid item xs={12} sm={12} lg={12}>
						<Card variant="block" style={{ borderRadius: "6px 6px 0 0" }}>
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
						</Card>
					</Grid>

					{this.renderEvents()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(EventsList);
