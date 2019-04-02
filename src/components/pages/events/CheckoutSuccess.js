import React, { Component } from "react";
import { Dialog, Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Hidden from "@material-ui/core/Hidden";
import Slide from "@material-ui/core/Slide";

import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import { fontFamilyBold, fontFamilyDemiBold, secondaryHex, textColorPrimary } from "../../styles/theme";
import Card from "../../elements/Card";
import AppButton from "../../elements/AppButton";
import SMSLinkForm from "../../elements/SMSLinkForm";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";
import NotFound from "../../common/NotFound";
import TwoColumnLayout from "./TwoColumnLayout";
import Button from "../../elements/Button";
import Divider from "../../common/Divider";
import user from "../../../stores/user";
import getUrlParam from "../../../helpers/getUrlParam";
import getPhoneOS from "../../../helpers/getPhoneOS";

const heroHeight = 800;

const iPhone5MediaQuery = "@media (max-width:321px)";

const styles = theme => {
	return ({
		root: {
			backgroundColor: "#FFFFFF"
		},
		mobileContent: {
			flex: 1,
			flexDirection: "column",
			background: "linear-gradient(-135deg, #9C2D82 0%, #3965A6 100%)",
			display: "flex"
		},
		mobileTopContent: {
			flex: 1,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileHeaderRow: {
			height: 50,
			display: "flex",
			justifyContent: "space-between",
			alignItems: "flex-end",
			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileHeaderIcon: {
			width: 18,
			height: "auto"
		},
		mobilePopupCard: {
			backgroundColor: "#FFFFFF",
			borderRadius: "15px 15px 0 0",
			paddingTop: 35,
			paddingBottom: 20,
			textAlign: "center",

			paddingLeft: 22,
			paddingRight: 22,
			[iPhone5MediaQuery]: {
				paddingLeft: 16,
				paddingRight: 16
			}
		},
		mobileSuccessHeading: {
			fontSize: theme.typography.fontSize * 1.75,
			color: "#FFFFFF",
			lineHeight: 1,
			fontFamily: fontFamilyDemiBold,
			[iPhone5MediaQuery]: {
				fontSize: theme.typography.fontSize * 1.5
			}
		},
		mobileSuccessText: {
			marginTop: 12,
			fontSize: theme.typography.fontSize * 1.065,
			color: "#FFFFFF"
		},
		mobileCardTitle: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.3125,
			marginBottom: 28
		},
		mobileExplainerText: {
			lineHeight: 0.95
		},
		cardSpacer: {
			marginTop: 100,
			[iPhone5MediaQuery]: {
				marginTop: 80
			}
		},
		highlightText: {
			fontFamily: fontFamilyDemiBold,
			color: secondaryHex
		},
		buttonContainer: {
			marginTop: 27,
			marginBottom: 27
		},
		mobileFooterText: {
			color: textColorPrimary
		},
		desktopHeroContent: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingBottom: theme.spacing.unit * 2,
			height: heroHeight
		},
		desktopCardContent: {
			paddingRight: theme.spacing.unit * 4,
			paddingLeft: theme.spacing.unit * 4,
			textAlign: "center"
		},
		desktopCoverImage: {
			height: heroHeight,
			width: "100%",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			position: "absolute",
			backgroundImage: "linear-gradient(-135deg, #E53D96 0%, #5491CC 100%)"
		},
		desktopHeroTopLine: {
			color: "#FFFFFF",
			fontSize: theme.typography.fontSize * 1.25,
			fontFamily: fontFamilyBold
		},
		desktopHeroTitle: {
			color: "#FFFFFF",
			fontSize: theme.typography.fontSize * 3.15,
			fontFamily: fontFamilyBold
		},
		underlinedSpacer: {
			borderBottom: "solid",
			borderBottomColor: secondaryHex,
			borderBottomWidth: 4,
			width: 41,
			marginBottom: 31
		},
		desktopOverlayCardHeader: {
			background: "linear-gradient(-135deg, #9C2D82 0%, #3965A6 100%)",
			height: 167,
			padding: theme.spacing.unit,
			paddingLeft: 65,
			display: "flex",
			alignItems: "center"
		},
		desktopEventDetailContainer: {
			paddingTop: 4
		},
		desktopEventDetailText: {
			color: "#FFFFFF"
		},
		desktopEventDetailsRow: {
			display: "flex",
			justifyContent: "flex-start",
			marginBottom: 30
		},
		desktopIconContainer: {
			marginRight: 12
		},
		desktopIcon: {
			width: 22,
			height: "auto"
		},
		boldText: {
			fontFamily: fontFamilyDemiBold
		},
		link: {
			color: secondaryHex
		},
		desktopSuccessTitle: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.75,
			color: "#FFFFFF",
			lineHeight: 1
		},
		desktopFooterText: {
			color: textColorPrimary
		},
		desktopCardFooterContainer: {
			padding: 28,
			paddingRight: 82,
			paddingLeft: 82,
			textAlign: "center"
		}
	});
};

const EventDetail = ({ classes, children, iconUrl }) => (
	<div className={classes.desktopEventDetailsRow}>
		<div className={classes.desktopIconContainer}>
			<img className={classes.desktopIcon} src={iconUrl}/>
		</div>

		<div className={classes.desktopEventDetailContainer}>
			{children}
		</div>
	</div>
);

const Hero = ({ classes, order_id }) => {
	return (
		<div className={classes.desktopCoverImage}>
			<TwoColumnLayout
				col1={(
					<div className={classes.desktopHeroContent}>
						<Typography className={classes.desktopHeroTopLine}>Almost done...</Typography>
						<Typography className={classes.desktopHeroTitle}>Get your tickets!</Typography>

						<span className={classes.underlinedSpacer}/>

						<Typography className={classes.desktopEventDetailText}>
							To enhance your experience and protect you against counterfeit ticket sales,
							<br/>
							<span className={classes.boldText}>tickets are accessible through the Big Neon App.</span>
						</Typography>

						<br/><br/>

						<Typography className={classes.desktopEventDetailText}>
							{order_id ? <span>Order <span className={classes.boldText}>#{order_id.slice(-8)}</span><br/></span> : null}
							We’ve also sent your receipt to: <span className={classes.boldText}>{user.email}</span>
						</Typography>
					</div>
				)}
			/>
		</div>
	);
};

@observer
class CheckoutSuccess extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mobileDialogOpen: true,
			mobileCardSlideIn: true,
			order_id: null,
			phoneOS: getPhoneOS()
		};
	}

	componentDidMount() {
		cart.emptyCart(); //TODO move this to after they've submitted the final form

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

			const order_id = getUrlParam("order_id");
			if (order_id) {
				this.setState({ order_id });
			}
		} else {
			//TODO return 404
		}
	}

	goHome() {
		this.setState({ mobileCardSlideIn: false }, () => {
			setTimeout(() => {
				this.setState({ mobileDialogOpen: false }, () => {
					setTimeout(() => {
						this.props.history.push("/");
					}, 80);
				});
			}, 200);
		});
	}

	render() {
		const { classes } = this.props;

		const { event, venue } = selectedEvent;

		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <NotFound>Event not found.</NotFound>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			promo_image_url,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment
		} = event;

		const { mobileDialogOpen, mobileCardSlideIn, order_id, phoneOS } = this.state;

		return (
			<div className={classes.root}>
				<Meta type={"success"} {...event}/>

				{/*DESKTOP*/}
				<Hidden smDown>
					<div style={{ height: heroHeight * 1.2 }}>
						<Hero order_id={order_id} classes={classes}/>
						<TwoColumnLayout
							containerClass={classes.desktopContent}
							containerStyle={{ minHeight: heroHeight }}
							col1={null}
							col2={(
								<EventDetailsOverlayCard
									style={{
										width: "100%",
										top: 150,
										position: "relative"
									}}
									header={(
										<div className={classes.desktopOverlayCardHeader}>
											<Typography className={classes.desktopSuccessTitle}>
												Download the Big Neon App.
												<br/>
												Get your tickets.
												<br/>
												Simple.
											</Typography>
										</div>
									)}
								>
									<div>
										<div className={classes.desktopCardContent}>
											<SMSLinkForm/>
										</div>

										<Divider/>

										<div className={classes.desktopCardFooterContainer}>
											<Typography className={classes.desktopFooterText}>
											No app? No sweat. Bring your ID and credit card to the will call line to get checked in.
											</Typography>
										</div>
									</div>
								</EventDetailsOverlayCard>
							)}
						/>
					</div>
				</Hidden>

				{/*MOBILE*/}
				<Hidden mdUp>
					<div style={{ marginBottom: 500 }}/>
					<Dialog
						fullScreen
						aria-labelledby="dialog-title"
						onEntering={() => {}}
						onExiting={() => {}}
						open={mobileDialogOpen}
					>
						<div className={classes.mobileContent}>
							<div className={classes.mobileHeaderRow}>
								{/*TODO once my-events is mobile friendly redirect there?*/}
								<div onClick={this.goHome.bind(this)}>
									<img className={classes.mobileHeaderIcon} alt="close" src="/icons/close-white.svg"/>
								</div>
								<div>
									{/*<img className={classes.mobileHeaderIcon} alt="share" src="/icons/share-white.svg"/>*/}
								</div>
							</div>

							<div className={classes.mobileTopContent}>
								<Typography className={classes.mobileSuccessHeading}>
									Download the Big Neon App.
									<br/>
									Get your tickets.
									<br/>
									Simple.
								</Typography>

								<Typography className={classes.mobileSuccessText}>
									To enhance your experience and protect you against counterfeit ticket sales,
									<span className={classes.boldText}> tickets are accessible through the Big Neon App.</span>
								</Typography>
							</div>
							<div>
								<Slide direction="up" in={mobileCardSlideIn}>
									<div className={classes.mobilePopupCard}>
										<div className={classes.buttonContainer}>
											<AppButton
												href={process.env.REACT_APP_DOWNLOAD_APP}
												variant={phoneOS}
												color={"callToAction"}
												style={{ width: "100%" }}
											>
												Get my tickets
											</AppButton>
										</div>
										<div className={classes.cardSpacer}/>
										<Typography className={classes.mobileFooterText}>
											No app? No sweat. Bring your ID and credit card to the will call line to get checked in.
										</Typography>
									</div>
								</Slide>
							</div>
						</div>
					</Dialog>
				</Hidden>
			</div>
		);
	}
}

CheckoutSuccess.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSuccess);
