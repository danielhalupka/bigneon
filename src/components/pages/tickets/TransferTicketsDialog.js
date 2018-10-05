import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import QRCode from "qrcode.react";

import { primaryHex } from "../../styles/theme";
import DialogTransition from "../../common/DialogTransition";
import Typography from "@material-ui/core/Typography";

const styles = {};

class TransferTicketsDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { onClose, ticketIds, classes, ...other } = this.props;

		let ticketIdsString = "";
		if (ticketIds) {
			ticketIdsString = ticketIds.join();
		}

		const qrText = `Coming soon (TM) :${ticketIdsString}`;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={onClose}
				aria-labelledby="dialog-title"
				{...other}
			>
				<DialogContent>
					<Typography variant="headline">
						Scan with your bigNEON mobile wallet to transfer
					</Typography>
					<br />
					{qrText ? (
						<div
							style={{
								display: "flex",
								alignContent: "center",
								justifyContent: "center"
							}}
						>
							<QRCode size={350} fgColor={primaryHex} value={qrText} />
						</div>
					) : null}
				</DialogContent>
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
