import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Bigneon from "../../../../helpers/bigneon";
import notification from "../../../../stores/notifications";
import Dialog from "../../../elements/Dialog";
import { fontFamilyDemiBold, secondaryHex } from "../../../styles/theme";
import { validPhone } from "../../../../validators";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import InputWithButton from "../../../common/form/InputWithButton";

const styles = theme => ({
	content: {
		maxWidth: 400,
		alignContent: "center",
		textAlign: "center",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	orderNumber: {
		fontFamily: fontFamilyDemiBold,
		marginBottom: theme.spacing.unit * 3
	},
	subText: {
		marginBottom: theme.spacing.unit * 3
	},
	smsLabel: {
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase",
		textAlign: "left",
		fontSize: theme.typography.fontSize * 0.9,
		marginBottom: 2
	}
});

class PurchaseSuccessOptionsDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = { isSendingSMS: false, isCheckingIn: false };
	}

	onSendSMS(number) {
		if (!validPhone(number)) {
			return notifications.show({
				message: "Invalid cellphone number.",
				variant: "warning"
			});
		}

		this.setState({ isSendingSMS: true });
	}

	onCheckIn() {
		this.setState({ isCheckingIn: true });
		//TODO

		setTimeout(() => {
			this.setState({ isCheckingIn: false });

			const { onCheckInSuccess } = this.props;
			onCheckInSuccess();
		}, 3000);
	}

	render() {
		const { onClose, open, classes } = this.props;
		const { isSendingSMS, isCheckingIn } = this.state;

		const iconUrl = "/icons/tickets-white.svg";

		const id = "FIXME_orderID";
		const orderNumber = "1234FIXME";
		const email = "FIXME@TODO.com";

		const buttonStyle = { width: "100%", marginBottom: 20 };

		return (
			<Dialog
				open={open}
				//onClose={onClose}
				title="Order complete"
				iconUrl={iconUrl}
			>
				<div className={classes.content}>
					<Typography className={classes.orderNumber}>
						Order #{orderNumber}
					</Typography>

					<Typography className={classes.subText}>
						We've sent your receipt to: {email}
					</Typography>

					<Typography className={classes.smsLabel}>
						Send ticket via SMS
					</Typography>
					<InputWithButton
						style={buttonStyle}
						iconUrl={"/icons/cellphone-gray.svg"}
						name={"cellNumber"}
						placeholder="Enter cellphone number"
						buttonText={isSendingSMS ? "Sending..." : "Send"}
						onSubmit={this.onSendSMS.bind(this)}
						disabled={isSendingSMS}
					/>

					<Button
						size="large"
						style={buttonStyle}
						onClick={this.onCheckIn.bind(this)}
						disabled={isCheckingIn}
					>
						{isCheckingIn ? "Checking in..." : "Check-in Guest"}
					</Button>
					<a href={`/orders/${id}`} target="_blank">
						<Button size="large" style={buttonStyle}>
							View order
						</Button>
					</a>

					<Button size="large" style={buttonStyle} onClick={onClose}>
						Return to Box Office
					</Button>
				</div>
			</Dialog>
		);
	}
}

PurchaseSuccessOptionsDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onCheckInSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(PurchaseSuccessOptionsDialog);
