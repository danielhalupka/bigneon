import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DialogActions from "@material-ui/core/DialogActions";
import QRCode from "qrcode.react";

import { primaryHex } from "../../styles/theme";
import DialogTransition from "../../common/DialogTransition";
import Button from "../../common/Button";
import InputGroup from "../../common/form/InputGroup";
import { validEmail } from "../../../validators";
import notification from "../../../stores/notifications";

const styles = {
	content: {
		minWidth: 400,
		alignContent: "center"
	}
};

class TransferTicketsDialog extends React.Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			transferOption: null,
			email: "",
			errors: {},
			isSubmitting: false
		};

		this.state = this.defaultState;

		this.onClose = this.onClose.bind(this);
		this.changeTransferOption = this.changeTransferOption.bind(this);
	}

	changeTransferOption(e) {
		this.setState({ transferOption: e.target.value });
	}

	onClose() {
		const { isSubmitting } = this.state;
		if (isSubmitting) {
			return;
		}

		const { onClose } = this.props;
		this.setState(this.defaultState);
		onClose();
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { email } = this.state;

		const errors = {};

		if (!email) {
			errors.email = "Missing email.";
		} else if (!validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmitEmail(e) {
		e.preventDefault();

		const { email } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		//TODO hook in api
		setTimeout(() => {
			this.setState({ isSubmitting: false }, () => {
				this.onClose();
				notification.show({ message: "Feature coming soon" });
			});
		}, 1000);
	}

	renderQRCode() {
		const { ticketIds } = this.props;

		if (!ticketIds) {
			return null;
		}

		const ticketIdsString = ticketIds.join();

		const qrText = `Coming soon (TM) :${ticketIdsString}`;

		return (
			<div
				style={{
					display: "flex",
					alignContent: "center",
					justifyContent: "center"
				}}
			>
				<QRCode size={350} fgColor={primaryHex} value={qrText} />
			</div>
		);
	}

	renderEmail() {
		const { ticketIds } = this.props;

		if (!ticketIds) {
			return null;
		}

		const { email, errors } = this.state;

		return (
			<InputGroup
				error={errors.email}
				value={email}
				name="email"
				label="Email address"
				type="email"
				onChange={e => this.setState({ email: e.target.value })}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	render() {
		const { ticketIds, classes, ...other } = this.props;
		const { transferOption, isSubmitting } = this.state;

		let heading = "";
		if (ticketIds) {
			heading = `Transfer ${ticketIds.length} ticket${
				ticketIds.length > 1 ? "s" : ""
			}`;
		}

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				aria-labelledby="dialog-title"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
				{...other}
				onClose={this.onClose}
			>
				<DialogContent className={classes.content}>
					<Typography variant="headline">{heading}</Typography>

					<RadioGroup
						aria-label="Ringtone"
						name="ringtone"
						value={transferOption}
						onChange={this.changeTransferOption}
					>
						<FormControlLabel
							value={"email"}
							control={<Radio />}
							label={"Via email"}
						/>
						<FormControlLabel
							value={"qr"}
							control={<Radio />}
							label={"Via QR code"}
						/>
					</RadioGroup>

					{transferOption === "qr" ? this.renderQRCode() : null}
					{transferOption === "email" ? this.renderEmail() : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={isSubmitting} onClick={this.onClose}>
						Cancel
					</Button>
					{transferOption === "email" ? (
						<Button
							onClick={this.onSubmitEmail.bind(this)}
							customClassName="callToAction"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Sending..." : "Send tickets"}
						</Button>
					) : null}
				</DialogActions>
			</Dialog>
		);
	}
}

TransferTicketsDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	ticketIds: PropTypes.array
};

export default withStyles(styles)(TransferTicketsDialog);
