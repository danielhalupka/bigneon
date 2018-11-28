import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Hidden from "@material-ui/core/Hidden";
import QRCode from "qrcode.react";

import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import { fontFamilyDemiBold } from "../../styles/theme";
import Card from "../../elements/Card";
import AppButton from "../../elements/AppButton";

const qrWidth = 300;

const styles = theme => ({
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4,
		backgroundColor: theme.palette.background.default
	},
	qrContainer: {
		padding: theme.spacing.unit
	},
	appDetails: {
		paddingTop: theme.spacing.unit * 2,
		textAlign: "center"
	},
	appHeading: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		marginBottom: theme.spacing.unit
	},
	appDetail: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		marginBottom: theme.spacing.unit
	}
});

@observer
class CheckoutSuccess extends Component {
	constructor(props) {
		super(props);

		this.state = {};
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
				<QRCode size={qrWidth} fgColor={"#000000"} value={qrText} />
			</Card>
		);
	}

	render() {
		const { classes } = this.props;

		const { event, artists } = selectedEvent;

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

		const headerHeight = 750;

		return (
			<div>
				<EventHeaderImage
					variant="success"
					height={headerHeight}
					{...event}
					artists={artists}
				/>

				{/* Desktop */}
				<div>
					<Hidden smDown implementation="css">
						<EventDetailsOverlayCard
							style={{
								width: "25%",
								minWidth: qrWidth + 100,
								maxWidth: 400,
								top: headerHeight / 3.1,
								right: 200,
								height: "100%"
							}}
							imageSrc={promo_image_url}
						>
							<div className={classes.eventSubCardContent}>
								<div className={classes.qrContainer}>{this.renderQRCode()}</div>
							</div>
						</EventDetailsOverlayCard>
					</Hidden>

					{/* Mobile */}
					<Hidden mdUp>
						<EventDetailsOverlayCard
							style={{
								width: "100%",
								paddingLeft: 20,
								paddingRight: 20,
								top: 500
							}}
						>
							{this.renderQRCode()}
						</EventDetailsOverlayCard>

						<div className={classes.appDetails}>
							<Typography className={classes.appHeading}>
								Get the bigNEON app
								<br />
								to access your tickets
							</Typography>
							<Typography className={classes.appDetail}>
								The mobile app is required to use your tickets at the show
							</Typography>
							<br />

							<AppButton
								color="black"
								href="https://itunes.apple.com/us/genre/ios/id36?mt=8"
								variant="ios"
							>
								iOS
							</AppButton>

							<span style={{ marginLeft: 20 }} />

							<AppButton
								color="black"
								href="https://play.google.com"
								variant="android"
							>
								Android
							</AppButton>
						</div>
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
