import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import Hidden from "@material-ui/core/Hidden";

import Button from "../../elements/Button";
import OrgAnalytics from "../../common/OrgAnalytics";
import Divider from "../../common/Divider";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import { fontFamilyBold, secondaryHex, textColorPrimary } from "../../styles/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import nl2br from "../../../helpers/nl2br";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import { displayAgeLimit } from "../../../helpers/ageLimit";
import NotFound from "../../common/NotFound";
import MaintainAspectRatio from "../../elements/MaintainAspectRatio";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";
import ellipsis from "../../../helpers/ellipsis";
import { dollars } from "../../../helpers/money";
import MobileBottomBarCTA from "./MobileBottomBarCTA";
import SupportingArtistsLabel from "./SupportingArtistsLabel";
import TwoColumnLayout from "./TwoColumnLayout";
import EventDescriptionBody from "./EventDescriptionBody";
import addressLineSplit from "../../../helpers/addressLineSplit";
import layout from "../../../stores/layout";

const styles = theme => {
	return ({
		root: {},
		desktopContent: {
			backgroundColor: "#FFFFFF"
		},
		mobileHeaderImage: {
			height: "100%",
			width: "100%",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center"
		},
		cardTopLineInfo: {
			fontFamily: fontFamilyBold,
			textTransform: "uppercase",
			color: "#979797",
			fontSize: theme.typography.fontSize * 0.875,
			marginBottom: 5
		},
		cardArtists: {
			fontFamily: fontFamilyBold,
			color: "#979797",
			marginBottom: theme.spacing.unit * 2
		},
		desktopCardContent: {
			padding: theme.spacing.unit * 2
		},
		mobileContainer: {
			background: "#FFFFFF",
			padding: theme.spacing.unit * 2,
			paddingBottom: 0
		},
		mobileEventName: {
			fontFamily: fontFamilyBold,
			fontSize: theme.typography.fontSize * 1.565,
			lineHeight: 1
		},
		spacer: {
			marginTop: theme.spacing.unit * 4
		},
		callToActionContainer: {
			marginTop: theme.spacing.unit,
			marginBottom: theme.spacing.unit
		},
		callToAction: {
			width: "100%"
		},
		eventDetailsRow: {
			display: "flex"
		},
		iconContainer: {
			flex: 1
		},
		icon: {
			width: 22,
			height: "auto"
		},
		eventDetailContainer: {
			paddingTop: 4,
			flex: 6
		},
		eventDetailText: {
			color: "#3C383F"
		},
		eventDetailBoldText: {
			font: "inherit",
			fontFamily: fontFamilyBold
		},
		eventDetailLinkText: {
			font: "inherit",
			color: secondaryHex,
			cursor: "pointer"
		},
		divider: {
			marginTop: theme.spacing.unit,
			marginBottom: theme.spacing.unit * 4
		}
	});
};

const EventDetail = ({ classes, children, iconUrl }) => (
	<div className={classes.eventDetailsRow}>
		<div className={classes.iconContainer}>
			<img className={classes.icon} src={iconUrl}/>
		</div>

		<div className={classes.eventDetailContainer}>
			{children}
		</div>
	</div>
);

@observer
class ViewEvent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			overlayCardHeight: 600,
			showAllAdditionalInfo: false
		};
	}

	componentDidMount() {
		layout.toggleBelowFooterPadding(true);

		if (this.props.match && this.props.match.params && this.props.match.params.id) {
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

		//TODO add footer padding if on mobile to account for popup CAT
	}

	componentWillUnmount() {
		layout.toggleBelowFooterPadding(false);
	}

	// toggleUserInterest() {
	// 	if (!user.isAuthenticated) {
	// 		//Show dialog for the user to signup/login, try again when they're authenticated
	// 		user.showAuthRequiredDialog(this.toggleUserInterest.bind(this));
	// 		return;
	// 	}
	//
	// 	selectedEvent.toggleUserInterest();
	// }
	//
	// renderInterestedButton() {
	// 	if (!selectedEvent) {
	// 		return null;
	// 	}
	//
	// 	const { id, user_is_interested } = selectedEvent;
	//
	// 	if (user_is_interested === null) {
	// 		//Unknown
	// 		return null;
	// 	}
	//
	// 	return (
	// 		<Button
	// 			style={{ width: "100%", marginTop: 10 }}
	// 			variant={user_is_interested ? "default" : "primary"}
	// 			onClick={this.toggleUserInterest.bind(this)}
	// 		>
	// 			{user_is_interested ? "I'm not interested" : "I'm interested"}
	// 		</Button>
	// 	);
	// }

	get callToActionButtonDetails() {
		const { event, hasAvailableTickets } = selectedEvent;

		//TODO check why api is returning null for 'override_status' when it should be 'UseAccessCode'
		// if (hasAvailableTickets === false && !event.is_external) {
		// 	return { ctaText: "No available tickets", enabled: false };
		// }

		switch (event.override_status) {
			case "PurchaseTickets":
				return { ctaText: "Purchase Tickets", enabled: true };
			case "SoldOut":
				return {
					ctaText: "Sold Out",
					enabled: event.is_external ? false : true
				};
			case "OnSaleSoon":
				return {
					ctaText: "On Sale Soon",
					enabled: event.is_external ? false : true
				};
			case "TicketsAtTheDoor":
				return {
					ctaText: "Tickets At The Door",
					enabled: event.is_external ? false : true
				};
			case "UseAccessCode":
				return { ctaText: "Use Access Code", enabled: true };
			case "Free":
				return { ctaText: "Free", enabled: true };
			case "Rescheduled":
				return { ctaText: "Rescheduled", enabled: false };
			case "Cancelled":
				return { ctaText: "Cancelled", enabled: false };
			case "OffSale":
				return { ctaText: "Off-Sale", enabled: false };
			case "Ended":
				return { ctaText: "Sale Ended", enabled: false };
			default:
				return { ctaText: "Purchase Tickets", enabled: true };
		}
	}

	renderCallToActionButton() {
		const { classes } = this.props;
		const { event, id } = selectedEvent;
		const { is_external, external_url } = event;

		const { ctaText, enabled } = this.callToActionButtonDetails;

		if (!enabled) {
			return (
				<Button disabled className={classes.callToAction}>
					{ctaText}
				</Button>
			);
		}
		if (is_external) {
			return (
				<a href={external_url} target="_blank">
					<Button className={classes.callToAction} variant={"callToAction"}>
						{ctaText}
					</Button>
				</a>
			);
		} else {
			return (
				<Link to={`/events/${id}/tickets`}>
					<Button size={"mediumLarge"} className={classes.callToAction} variant={"callToAction"}>
						{ctaText}
					</Button>
				</Link>
			);
		}
	}

	onOverlayCardHeightChange(overlayCardHeight) {
		this.setState({ overlayCardHeight });
	}

	showHideMoreAdditionalInfo() {
		this.setState(({ showAllAdditionalInfo }) => ({ showAllAdditionalInfo: !showAllAdditionalInfo }));
	}

	priceTagText(min, max, separator = "to") {
		if ((min === null || isNaN(min)) && (max === null || isNaN(max))) {
			return null;
		}

		if (min === null || isNaN(min)) {
			return dollars(max);
		}

		if ((max === null || isNaN(max)) || min === max) {
			return dollars(min);
		}

		return `${dollars(min)} ${separator} ${dollars(max)}`;
	}

	render() {
		const { classes } = this.props;
		const {
			event,
			venue,
			artists,
			organization,
			id,
			ticket_types,
			hasAvailableTickets
		} = selectedEvent;

		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			) ;
		}

		if (event === false) {
			return <NotFound>Event not found.</NotFound>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment,
			is_external,
			tracking_keys,
			external_url,
			min_ticket_price,
			max_ticket_price
		} = event;

		const promo_image_url = event.promo_image_url ? optimizedImageUrl(event.promo_image_url) : null;

		const ageLimitText  = displayAgeLimit(age_limit);

		const mobilePromoImageStyle = {};
		if (promo_image_url) {
			mobilePromoImageStyle.backgroundImage = `url(${promo_image_url})`;
		}

		const { showAllAdditionalInfo } = this.state;

		const priceTagText = this.priceTagText(min_ticket_price, max_ticket_price);

		const sharedContent = (
			<div>
				<div className={classes.callToActionContainer}>
					{this.renderCallToActionButton()}
				</div>

				<div className={classes.spacer}/>

				<EventDetail classes={classes} iconUrl={"/icons/events-black.svg"}>
					<Typography className={classes.eventDetailText}>
						<span className={classes.eventDetailBoldText}>{displayEventStartDate}</span>
						<br/>
						Doors {displayDoorTime} - Show {displayShowTime}
						<br/>
						{ageLimitText}
					</Typography>
				</EventDetail>

				{priceTagText ? (
					<div>
						<Divider className={classes.divider}/>

						<EventDetail classes={classes} iconUrl={"/icons/ticket-black.svg"}>
							<Typography className={classes.eventDetailText}>
							Tickets from {priceTagText}
							</Typography>
						</EventDetail>
					</div>
				) : null}

				<Divider className={classes.divider}/>

				<EventDetail classes={classes} iconUrl={"/icons/location-black.svg"}>
					<Typography className={classes.eventDetailText}>
						{venue.name}
						<br/>
						{addressLineSplit(venue.address)}
						{venue.googleMapsLink ? (
							<a target="_blank" href={venue.googleMapsLink}>
								<span className={classes.eventDetailLinkText}><br/>View map</span>
							</a>
						) : null}
					</Typography>
				</EventDetail>
			</div>
		);

		//Need to move the description and artist details down and adjust the height of the main container. But we don't know how much space the overlayed div will take.
		const overlayCardHeightAdjustment = this.state.overlayCardHeight - 150;

		return (
			<div className={classes.root}>
				<OrgAnalytics trackingKeys={tracking_keys}/>
				<Meta {...event}/>

				{/*DESKTOP*/}
				<Hidden smDown>
					<EventHeaderImage {...event} artists={artists}/>

					<TwoColumnLayout
						containerClass={classes.desktopContent}
						containerStyle={{ minHeight: overlayCardHeightAdjustment }}
						col1={<EventDescriptionBody artists={artists}>{additional_info}</EventDescriptionBody>}
						col2={(
							<EventDetailsOverlayCard
								style={{
									width: "100%",
									top: -310,
									position: "relative"
								}}
								imageSrc={promo_image_url}
								onHeightChange={this.onOverlayCardHeightChange.bind(this)}
							>
								<div className={classes.desktopCardContent}>
									{sharedContent}
								</div>
							</EventDetailsOverlayCard>
						)}
					/>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<MaintainAspectRatio heightRatio={0.5}>
						<div className={classes.mobileHeaderImage} style={mobilePromoImageStyle}/>
					</MaintainAspectRatio>
					<div className={classes.mobileContainer}>
						{top_line_info ? (
							<Typography className={classes.cardTopLineInfo}>
								{nl2br(top_line_info)}
							</Typography>
						) : null}

						<Typography className={classes.mobileEventName}>{name}</Typography>

						{artists && artists.length !== 0 ? (
							<Typography className={classes.cardArtists}>
								<SupportingArtistsLabel eventName={name} artists={artists}/>
							</Typography>
						) : null }

						{sharedContent}

						<Divider className={classes.divider}/>

						{additional_info ? (
							<div>
								<EventDetail classes={classes} iconUrl={"/icons/event-detail-black.svg"}>
									<Typography className={classes.eventDetailText}>
										{showAllAdditionalInfo ? nl2br(additional_info) : nl2br(ellipsis(additional_info, 300))}
										<span className={classes.eventDetailLinkText} onClick={this.showHideMoreAdditionalInfo.bind(this)}>
											{showAllAdditionalInfo ? "Read less" : "Read more"}
										</span>
									</Typography>
								</EventDetail>

								<Divider className={classes.divider} style={{ marginBottom: 0 }}/>
							</div>
						) : null}
					</div>

					<MobileBottomBarCTA
						button={this.renderCallToActionButton()}
						priceRange={this.priceTagText(min_ticket_price, max_ticket_price, "-")}
					/>
				</Hidden>
			</div>
		);
	}
}

ViewEvent.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ViewEvent);
