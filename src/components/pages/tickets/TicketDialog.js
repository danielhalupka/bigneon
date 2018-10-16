import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import QRCode from "qrcode.react";

import { primaryHex } from "../../styles/theme";
import DialogTransition from "../../common/DialogTransition";
import Typography from "@material-ui/core/Typography";

const styles = {
	dialogContent: {}
};

class TicketDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { ticket, eventName, classes, onClose, ...other } = this.props;

		const qrText = ticket ? ticket.id : "";
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
					<Typography variant="display1">{eventName}</Typography>
					<Typography variant="subheading">{ticketName}</Typography>
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
					) : null}
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
