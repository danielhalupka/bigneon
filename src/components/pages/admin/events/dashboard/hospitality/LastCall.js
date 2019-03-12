import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import Container from "../Container";
import { fontFamilyDemiBold, primaryHex, secondaryHex } from "../../../../../styles/theme";
import Dialog from "../../../../../elements/Dialog";
import Loader from "../../../../../elements/loaders/Loader";

const styles = theme => ({
	root: {},
	parentHeading: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase",
		fontSize: theme.typography.fontSize * 0.8
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.4
	},
	description: {
		fontSize: theme.typography.fontSize * 1.1
	},
	descriptionHeading: {
		fontFamily: fontFamilyDemiBold
	},
	actionButtonContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	dialogContainer: {
		textAlign: "center",
		marginBottom: theme.spacing.unit * 2,
		marginTop: theme.spacing.unit * 2
	}
});

class LastCall extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			canTrigger: null,
			isSending: false,
			openConfirmDialog: false,
			notificationTriggered: false
		};
	}

	componentDidMount() {
		//TODO check if the event is running before enabling the button
		this.setState({ canTrigger: true });

		Bigneon()
			.events.broadcasts.index({ event_id: this.eventId })
			.then(response => {
				const { data } = response.data;

				let notificationTriggered = false;

				data.forEach(({ id, notification_type, status }) => {
					if (notification_type === "LastCall" && status === "Pending") {
						notificationTriggered = true;
					}
				});

				this.setState({ notificationTriggered });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading existing notifications failed."
				});
			});
	}

	onSend() {
		this.setState({ isSending: true, openConfirmDialog: false });

		Bigneon()
			.events.broadcasts.create({ event_id: this.eventId, notification_type: "LastCall" })
			.then(response => {
				const { data } = response.data;
				this.setState({ notificationTriggered: true });
				notifications.show({ message: "Notification triggered!", variant: "success" });
			})
			.catch(error => {
				this.setState({ isSending: false });

				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to trigger notifications."
				});
			});
	}

	renderConfirmDialog() {
		const { openConfirmDialog } = this.state;
		const { classes } = this.props;

		return (
			<Dialog
				open={openConfirmDialog}
				title={"Send last call notification"}
				iconUrl={"/icons/phone-white.svg"}
				onClose={() => this.setState({ openConfirmDialog: false })}
			>
				<div className={classes.dialogContainer}>
					<Typography className={classes.description}>
						<span className={classes.descriptionHeading}>This can only be sent once during your event.</span>
						<br/>
						All attendees who have enabled notifications on their devices will receive the Last Call message
					</Typography>
				</div>
				<div style={{ display: "flex" }}>
					<Button style={{ flex: 1, marginRight: 5 }} onClick={() => this.setState({ openConfirmDialog: false })}>Cancel</Button>
					<Button style={{ flex: 1, marginLeft: 5 }} variant={"callToAction"} onClick={this.onSend.bind(this)}>Send now</Button>
				</div>
			</Dialog>
		);
	}

	renderActionButton() {
		const { canTrigger, isSending, notificationTriggered } = this.state;

		if (notificationTriggered) {
			return <Button disabled>Notification triggered!</Button>;
		}

		if (canTrigger === null) {
			return <Loader>Checking status...</Loader>;
		}

		if (!canTrigger) {
			return <Button disabled>Not available</Button>;
		}

		if (isSending) {
			return <Button disabled>Sending...</Button>;
		}

		return (
			<Button variant={"callToAction"} onClick={() => this.setState({ openConfirmDialog: true })}>
				Send now
			</Button>
		);
	}

	render() {
		const { classes } = this.props;
		const { canTrigger } = this.state;

		return (
			<Container eventId={this.eventId} subheading={"tools"}>
				{this.renderConfirmDialog()}
				<Typography className={classes.parentHeading}>Hospitality</Typography>
				<Typography className={classes.heading}>Last call notification</Typography>

				<Typography>Last Call Notifications are optimized to drive food and beverage sales by intelligently engaging your attendees prior to the close of service to entice them to make a purchase.</Typography>

				<div className={classes.actionButtonContainer}>
					{this.renderActionButton()}
				</div>

				{!canTrigger ? (
					<Typography className={classes.description}>
						<span className={classes.descriptionHeading}>Why Not?</span> Last call notifications can only be triggered during your event.
					</Typography>
				) : null}

				<br/><br/>

				<Typography className={classes.description}>
					<span className={classes.descriptionHeading}>How does it work?</span>
					<br/>
					All attendees who have enabled notifications on their devices will receive the Last Call message on their home screen: “🗣LAST CALL! 🍻The bar is closing soon, grab something now before it’s too late!”
					The message will be throttled to control traffic flow to your bar.
					This can only be used once during your event.
				</Typography>

			</Container>
		);
	}
}

export default withStyles(styles)(LastCall);
