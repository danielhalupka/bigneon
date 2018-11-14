import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import QRCode from "qrcode.react";

import { primaryHex } from "../../styles/theme";
import DialogTransition from "../../common/DialogTransition";
import Bigneon from "../../../helpers/bigneon";
import notification from "../../../stores/notifications";

const styles = {
	dialogContent: {}
};

class TicketDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			qrText: ""
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
		this.setState({ qrText: "" }, () => {
			const { ticket } = this.props;

			Bigneon()
				.tickets.redeem.read({
					ticket_id: ticket.id
				})
				.then(response => {
					const { id, redeem_key } = response.data;

					const qrObj = { type: 0, data: { redeem_key, id, extra: "" } };

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

	render() {
		const { ticket, eventName, classes, onClose, ...other } = this.props;
		const { qrText } = this.state;

		const ticketName = ticket ? ticket.ticket_type_name : "";

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={onClose}
				aria-labelledby="dialog-title"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
				{...other}
			>
				<DialogContent>
					<Typography variant="display1">
						{eventName} <small>({ticketName})</small>
					</Typography>
					<Typography variant="subheading">Show this to the doorman</Typography>
					{qrText ? (
						<div
							style={{
								display: "flex",
								alignContent: "center",
								justifyContent: "center"
							}}
						>
							<QRCode size={300} fgColor={primaryHex} value={qrText} />
						</div>
					) : (
						<Typography variant="display1">Loading</Typography>
					)}
				</DialogContent>
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
