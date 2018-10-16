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
import Bigneon from "../../../helpers/bigneon";
import Divider from "../../common/Divider";

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
			email: "",
			errors: {},
			qrText: "",
			isSubmitting: false
		};

		this.state = this.defaultState;
		this.onClose = this.onClose.bind(this);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const { ticketIds } = this.props;

		if (ticketIds) {
			if (!prevProps.ticketIds) {
				//No original state to compare just get the new QR text
				this.refreshQrText();
			} else if (ticketIds.length !== prevProps.ticketIds.length) {
				this.refreshQrText();
			} else {
				//If the user changed the checked ticket IDs at all then we need to refresh the claiming QR text
				let differentTicketIds = false;

				for (let index = 0; index < ticketIds.length; index++) {
					if (ticketIds[index] !== prevProps.ticketIds[index]) {
						differentTicketIds = true;
					}
				}

				if (differentTicketIds) {
					this.refreshQrText();
				}
			}
		}
	}

	refreshQrText() {
		this.setState({ qrText: "" }, () => {
			const { ticketIds } = this.props;

			Bigneon()
				.tickets.transfer.transfer({
					ticket_ids: ticketIds,
					validity_period_in_seconds: 60 * 60
				}) //TODO make this config based
				.then(response => {
					const {
						transfer_key,
						signature,
						sender_user_id,
						num_tickets
					} = response.data;

					const qrObj = {
						type: 0,
						data: {
							transfer_key,
							signature,
							sender_user_id,
							num_tickets,
							extra: ""
						}
					};

					const qrText = JSON.stringify(qrObj);

					this.setState({ qrText });
				})
				.catch(error => {
					console.error(error);
					let message = "Creating QR code failed failed.";
					if (
						error.response &&
						error.response.data &&
						error.response.data.error
					) {
						message = error.response.data.error;
					}
					notification.show({
						message,
						variant: "error"
					});
				});
		});
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
		const { ticketIds } = this.props;

		Bigneon()
			.tickets.transfer.send({
				ticket_ids: ticketIds,
				validity_period_in_seconds: 60 * 60 * 24, //TODO make this config based
				email
			})
			.then(response => {
				this.setState({ isSubmitting: false }, () => {
					this.onClose();

					notification.show({
						message: "Email sent.",
						variant: "success"
					});
				});
			})
			.catch(error => {
				this.setState({ isSubmitting: false });
				console.error(error);
				let message = "Send tickets via email failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}
				notification.show({
					message,
					variant: "error"
				});
			});
	}

	renderQRCode() {
		const { ticketIds } = this.props;
		const { qrText } = this.state;

		if (!ticketIds || !qrText) {
			return null;
		}

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
				label="Send via email address"
				type="email"
				onChange={e => this.setState({ email: e.target.value })}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	render() {
		const { ticketIds, classes, ...other } = this.props;
		const { isSubmitting } = this.state;

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

					<Typography variant="subheading">Scan with the mobile app</Typography>

					{this.renderQRCode()}

					<Divider style={{ marginTop: 40, marginBottom: 0 }}>Or</Divider>

					{this.renderEmail()}
				</DialogContent>
				<DialogActions>
					<Button disabled={isSubmitting} onClick={this.onClose}>
						Cancel
					</Button>
					<Button
						onClick={this.onSubmitEmail.bind(this)}
						customClassName="callToAction"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Sending..." : "Send tickets"}
					</Button>
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
