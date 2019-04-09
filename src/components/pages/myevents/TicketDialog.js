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

		const iconUrl = "/icons/tickets-white.svg";

		return (
			<Dialog
				onClose={onClose}
				iconUrl={iconUrl}
				title={`${eventName} (${ticketName})`}
				{...other}
			>
				<div className={classes.content}>
					<Typography variant="subheading">
						Scanning this redeems the ticket.
					</Typography>
					{qrText ? (
						<div
							style={{
								display: "flex",
								alignContent: "center",
								justifyContent: "center"
							}}
						>
							<QRCode size={300} fgColor={primaryHex} value={qrText}/>
						</div>
					) : (
						<Loader/>
					)}
				</div>
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
