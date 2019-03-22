import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Hidden from "@material-ui/core/Hidden";
import QRCode from "qrcode.react";

import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import { fontFamilyDemiBold, secondaryHex } from "../../styles/theme";
import Card from "../../elements/Card";
import AppButton from "../../elements/AppButton";
import SMSLinkForm from "../../elements/SMSLinkForm";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";

const overlayCardWidth = 350;

const styles = theme => ({
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4,
		backgroundColor: theme.palette.background.default
	},
	cardContent: {
		padding: theme.spacing.unit * 2
	},
	appDetails: {
		paddingTop: theme.spacing.unit * 2
	},
	appHeading: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.1,
		marginBottom: theme.spacing.unit
	},
	appDetail: {
		fontSize: theme.typography.fontSize * 0.9,
		marginBottom: theme.spacing.unit
	},
	appDetailBold: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		marginBottom: theme.spacing.unit
	},
	appDetailsHighlight: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		color: secondaryHex
	},
	appButtonContainer: {
		display: "flex",
		justifyContent: "space-around"
	}
});

@observer
class CheckoutSuccess extends Component {
	constructor(props) {
		super(props);
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

			this.setState({ qrText: id }); //TODO find out what goes here
		} else {
			//TODO return 404
		}
	}

	renderQRCode() {
		const { qrText } = this.state;

		if (!qrText) {
			return null;
		}

		return (
			<Card
				variant="subCard"
				style={{
					display: "flex",
					alignContent: "center",
					justifyContent: "center",
					padding: 10
				}}
			>
				<QRCode size={overlayCardWidth} fgColor={"#000000"} value={qrText}/>
			</Card>
		);
	}

	render() {
		const { classes } = this.props;

		const { event, artists } = selectedEvent;

		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
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

		const headerHeight = 750;

		const appDetails = (
			<div>
				<div className={classes.appDetails}>
					<Typography className={classes.appHeading}>
						TO ACCESS YOUR TICKETS
						<br/>
						GET THE BIG NEON APP
					</Typography>
					<Typography className={classes.appDetail}>
						<span className={classes.appDetailsHighlight}>Speed through the entrance, share tickets with friends, and extend your experience using the Big Neon app</span>, or bring your ID and order confirmation and look for the will call line at the venue.
					</Typography>
					<Typography className={classes.appDetailBold}>
						To protect you from fraud and the spread of counterfeit tickets, <span className={classes.appDetailsHighlight}>printable tickets are not available.</span>
					</Typography>
					<br/>

					<div className={classes.appButtonContainer}>
						<AppButton
							color="black"
							href={process.env.REACT_APP_STORE_IOS}
							variant="ios"
							style={{ marginRight: 2 }}
						>
							iOS
						</AppButton>

						<AppButton
							color="black"
							href={process.env.REACT_APP_STORE_ANDROID}
							variant="android"
							style={{ marginLeft: 2 }}
						>
							Android
						</AppButton>
					</div>
				</div>
				<SMSLinkForm/>
			</div>
		);

		return (
			<div>
				<Meta type={"success"} {...event}/>

				<EventHeaderImage
					variant="success"
					height={headerHeight}
					{...event}
					artists={artists}
				/>

				{/* Desktop */}
				<div style={{ minHeight: 200 }}>
					<Hidden smDown implementation="css">
						<EventDetailsOverlayCard
							style={{
								width: "25%",
								minWidth: overlayCardWidth + 100,
								maxWidth: 400,
								top: headerHeight / 3.1,
								right: 200,
								height: "100%"
							}}
							imageSrc={promo_image_url}
						>
							<div className={classes.eventSubCardContent}>
								<div className={classes.cardContent}>
									{appDetails}
								</div>
							</div>
						</EventDetailsOverlayCard>
					</Hidden>

					{/* Mobile */}
					<Hidden mdUp>
						<EventDetailsOverlayCard
							style={{
								width: "100%",
								paddingLeft: 15,
								paddingRight: 15,
								top: 500
							}}
						>
							<div className={classes.cardContent}>
								{appDetails}
							</div>
						</EventDetailsOverlayCard>
					</Hidden>
				</div>
			</div>
		);
	}
}

CheckoutSuccess.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSuccess);
