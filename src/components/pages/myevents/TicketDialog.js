import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import QRCode from "qrcode.react";

import { primaryHex } from "../../../config/theme";
import Bigneon from "../../../helpers/bigneon";
import notification from "../../../stores/notifications";
import Dialog from "../../elements/Dialog";
import Loader from "../../elements/loaders/Loader";

const styles = {
	content: {
		minWidth: 400,
		alignContent: "center",
		textAlign: "center"
	}
};

class TicketDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			qrText: null
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const { ticket } = this.props;

		if (ticket) {
			if (!prevProps.ticket || ticket.id !== prevProps.ticket.id) {
				this.refreshQrText();
			}
		}
	}

	refreshQrText() {
		this.setState({ qrText: null }, () => {
			const { ticket } = this.props;

			Bigneon()
				.tickets.redeem.read({
					ticket_id: ticket.id
				})
				.then(response => {
					const { id, redeem_key } = response.data;

					if (!redeem_key) {
						this.setState({ qrText: false });
					} else {
						const qrObj = { type: 0, data: { redeem_key, id, extra: "" } };
						this.setState({ qrText: JSON.stringify(qrObj) });
					}
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

	renderQR() {
		const { qrText } = this.state;

		if (qrText === null) {
			return <Loader/>;
		}

		if (qrText === false) {
			//Redeem key is not available yet
			return (
				<div>
					<Typography>
						To protect you and your purchase against fraudulent activity the QR
						code used to grant access to the event will be hidden until closer
						to the event door time.
					</Typography>
				</div>
			);
		}

		return (
			<div>
				<Typography variant="subheading">
					Scanning this redeems the ticket.
				</Typography>
				<div
					style={{
						display: "flex",
						alignContent: "center",
						justifyContent: "center"
					}}
				>
					<QRCode size={300} fgColor={primaryHex} value={qrText}/>
				</div>
			</div>
		);
	}

	render() {
		const { ticket, eventName, classes, onClose, ...other } = this.props;

		const ticketName = ticket ? ticket.ticket_type_name : "";

		const iconUrl = "/icons/tickets-white.svg";

		return (
			<Dialog
				onClose={onClose}
				iconUrl={iconUrl}
				title={`${eventName} (${ticketName})`}
				{...other}
			>
				<div className={classes.content}>{this.renderQR()}</div>
			</Dialog>
		);
	}
}

TicketDialog.propTypes = {
	ticket: PropTypes.object,
	eventName: PropTypes.string,
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(TicketDialog);
