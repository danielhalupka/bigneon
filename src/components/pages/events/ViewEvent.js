import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import { observer } from "mobx-react";
import Hidden from "@material-ui/core/Hidden";

import Button from "../../elements/Button";
import SocialButton from "../../common/social/SocialButton";
import Divider from "../../common/Divider";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import user from "../../../stores/user";
import Card from "../../elements/Card";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import layout from "../../../stores/layout";
import { fontFamilyDemiBold } from "../../styles/theme";
import ArtistSummary from "../../elements/event/ArtistSummary";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import DateDropTag from "../../elements/event/DateDropTag";
import IconLink from "../../elements/social/IconLink";

const styles = theme => ({
	root: {},
	container: {
		paddingBottom: theme.spacing.unit * 15
	},
	eventDetailsContent: {
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit * 4
	},
	artistContainer: {
		marginBottom: theme.spacing.unit * 2
	},
	heading: {
		fontSize: theme.typography.fontSize * 2,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit * 2
	},
	description: {
		lineHeight: 1.67,
		fontSize: theme.typography.fontSize * 1.1,
		marginTop: theme.spacing.unit * 2,
		color: "#656d78"
	},
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4
	},
	eventSubCardRow1: {
		display: "flex",
		justifyContent: "space-between"
	},
	eventSubCardRow2: { marginTop: theme.spacing.unit * 4 },
	eventSubCardRow3: { marginTop: theme.spacing.unit * 4 },
	eventSubCardRow4: { marginTop: theme.spacing.unit * 4 },
	eventSubCardHeading: {
		fontSize: theme.typography.fontSize * 1.5,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit * 4
	},
	textAndIconRow: {
		display: "flex",
		alignContent: "center",
		alignItems: "center"
	},
	eventSubCardIcon: {
		marginRight: theme.spacing.unit * 2
	},
	eventSubCardSubHeading: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.8,
		lineHeight: 0,
		marginTop: 4
	},
	eventSubCardSubText: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		fontSize: theme.typography.fontSize * 0.8,
		color: "#9da3b4",
		lineHeight: 1.5
	},
	eventSubCardSubLink: {
		fontSize: theme.typography.fontSize * 0.75,
		color: "#ff22b2"
	},
	ticketPricing: {
		marginTop: theme.spacing.unit * 2,
		fontSize: theme.typography.fontSize * 1.1,
		fontFamily: fontFamilyDemiBold
	},
	ticketPricingValue: {
		fontSize: theme.typography.fontSize * 1.8,
		color: "#ff22b2"
	},
	callToAction: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		width: "100%"
	},
	socialLinks: {
		marginTop: theme.spacing.unit * 2,
		display: "flex",
		justifyContent: "center"
	}
});

@observer
class ViewEvent extends Component {
	componentDidMount() {
		layout.toggleSideMenu(false);
		layout.toggleContainerPadding(false);

		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	componentWillUnmount() {
		layout.toggleContainerPadding(true);
	}

	toggleUserInterest() {
		if (!user.isAuthenticated) {
			//Show dialog for the user to signup/login, try again when they're authenticated
			user.showAuthRequiredDialog(this.toggleUserInterest.bind(this));
			return;
		}

		selectedEvent.toggleUserInterest();
	}

	renderInterestedButton() {
		if (!selectedEvent) {
			return null;
		}

		const { id, user_is_interested } = selectedEvent;

		if (user_is_interested === null) {
			//Unknown
			return null;
		}

		return (
			<Button
				style={{ width: "100%", marginTop: 10 }}
				variant={user_is_interested ? "default" : "primary"}
				onClick={this.toggleUserInterest.bind(this)}
			>
				{user_is_interested ? "I'm not interested" : "I'm interested"}
			</Button>
		);
	}

	render() {
		const { classes } = this.props;
		const {
			event,
			venue,
			artists,
			organization,
			id,
			ticket_types
		} = selectedEvent;

		if (event === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			promo_image_url,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment
		} = event;

		const subCardContent = (
			<div className={classes.eventSubCardContent}>
				<div className={classes.eventSubCardRow1}>
					<Typography className={classes.eventSubCardHeading}>
						Time and location
					</Typography>
					<DateDropTag date={eventStartDateMoment} />
				</div>
				<div className={classes.eventSubCardRow2}>
					<div className={classes.textAndIconRow}>
						<img
							className={classes.eventSubCardIcon}
							src="/icons/events-black.svg"
						/>
						<Typography className={classes.eventSubCardSubHeading}>
							Date and time
						</Typography>
					</div>

					<Typography className={classes.eventSubCardSubText}>
						{displayEventStartDate}
						<br />
						Doors {displayDoorTime} - Show {displayShowTime}
						<br />
						{age_limit
							? `This event is for over ${age_limit} year olds`
							: "This event is for all ages"}
					</Typography>
				</div>

				<Divider />

				<div className={classes.eventSubCardRow3}>
					<div className={classes.textAndIconRow}>
						<img
							className={classes.eventSubCardIcon}
							src="/icons/location-black.svg"
						/>
						<Typography className={classes.eventSubCardSubHeading}>
							{venue.name}
						</Typography>
					</div>

					<Typography className={classes.eventSubCardSubText}>
						{venue.address}, {venue.city}.<br />
						{venue.postal_code}, {venue.state}, {venue.country}
						{venue.googleMapsLink ? (
							<a target="_blank" href={venue.googleMapsLink}>
								<span className={classes.eventSubCardSubLink}>
									&nbsp;-&nbsp;view map
								</span>
							</a>
						) : null}
					</Typography>
				</div>

				<Divider />

				<div className={classes.eventSubCardRow4}>
					<Typography className={classes.eventSubCardSubHeading}>
						Tickets
					</Typography>
					<br />

					{ticket_types.map(({ id, name, status, ticket_pricing }) => {
						let price = "";
						if (ticket_pricing) {
							price = ticket_pricing.price_in_cents / 100;
							//description = ticket_pricing.name;
							//TODO check if they're available, if none are available change the layout
						}
						return (
							<Typography key={id} className={classes.ticketPricing}>
								<span className={classes.ticketPricingValue}>${price}</span>
								&nbsp;&nbsp;
								{name}
							</Typography>
						);
					})}
					<Link to={`/events/${id}/tickets`}>
						<Button className={classes.callToAction} variant="callToAction">
							Tickets
						</Button>
					</Link>

					<div className={classes.socialLinks}>
						<IconLink
							color="black"
							style={{ marginRight: 4 }}
							icon={"facebook"}
							size={40}
						/>
						<IconLink
							color="black"
							style={{ marginLeft: 4 }}
							icon={"twitter"}
							size={40}
						/>
					</div>
				</div>
			</div>
		);

		return (
			<div>
				<EventHeaderImage
					name={name}
					topLineInfo={top_line_info}
					src={promo_image_url}
					artists={artists}
				/>

				<Grid container spacing={0} direction="row" justify="center">
					<Grid item xs={12} sm={12} md={11} lg={9}>
						<Card variant="plain">
							<Grid
								container
								spacing={0}
								direction="row"
								justify="center"
								className={classes.container}
							>
								<Grid item xs={12} sm={12} md={6} lg={6}>
									<div className={classes.eventDetailsContent}>
										<Typography className={classes.heading}>
											Description
										</Typography>
										<Typography className={classes.description}>
											{additional_info}
										</Typography>

										<Typography className={classes.heading}>Artists</Typography>
										{artists.map(({ artist }, index) => (
											<div key={index} className={classes.artistContainer}>
												<ArtistSummary headliner={index === 0} {...artist} />
											</div>
										))}
									</div>
								</Grid>

								<Grid item xs={12} sm={12} md={6} lg={6}>
									{/* Desktop */}
									<Hidden smDown implementation="css">
										<EventDetailsOverlayCard
											style={{
												width: "30%",
												maxWidth: 550,
												top: 220,
												right: 200
											}}
											imageSrc={promo_image_url}
										>
											{subCardContent}
										</EventDetailsOverlayCard>
									</Hidden>

									{/* Mobile */}
									<Hidden mdUp>
										<EventDetailsOverlayCard
											style={{
												width: "100%",
												paddingLeft: 20,
												paddingRight: 20,
												top: 300
											}}
											imageSrc={promo_image_url}
										>
											{subCardContent}
										</EventDetailsOverlayCard>
									</Hidden>
								</Grid>
							</Grid>
						</Card>
					</Grid>
				</Grid>
			</div>
		);
	}
}

ViewEvent.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ViewEvent);
