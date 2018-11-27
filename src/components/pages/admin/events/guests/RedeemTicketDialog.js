import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import {
	DialogContent,
	DialogContentText,
	DialogActions,
	Typography
} from "@material-ui/core";

import notifications from "../../../../../stores/notifications";
import Button from "../../../../elements/Button";
import Bigneon from "../../../../../helpers/bigneon";
import DialogTransition from "../../../../common/DialogTransition";

const styles = {};

class RedeemTicketDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false
		};
	}

	onSubmit(e) {
		e.preventDefault();

		const { onClose, ticket } = this.props;
		if (!ticket) {
			return;
		}

		this.setState({ isSubmitting: true });

		console.log(ticket);
		const { id, redeem_key } = ticket;

		Bigneon()
			.events.tickets
			.redeem({
				event_id: ticket.event_id,
				ticket_id: id,
				redeem_key
			})
			.then(response => {
				this.setState({ isSubmitting: false }, () => onClose());

				notifications.show({
					message: "Ticket redeemed",
					variant: "success"
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Redeeming ticket failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	render() {
		const { onClose, ticket = {} } = this.props;
		const { isSubmitting } = this.state;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={onClose}
				open={!!ticket}
				aria-labelledby="simple-dialog-title"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<DialogTitle id="simple-dialog-title">Redeem ticket</DialogTitle>
					{ticket ? (
						<DialogContent>
							<DialogContentText>
								{ticket.first_name} {ticket.last_name}
							</DialogContentText>
							<Typography variant="display1">
								1 X {ticket.ticket_type}
							</Typography>

							<Typography variant="subheading">
								Status: {ticket.status}
							</Typography>
						</DialogContent>
					) : null}

					<DialogActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={onClose}
							color="default"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							disabled={isSubmitting}
							type="submit"
							variant="callToAction"
						>
							{isSubmitting ? "Redeeming..." : "Redeem ticket"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
}

RedeemTicketDialog.propTypes = {
	ticket: PropTypes.object,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(RedeemTicketDialog);
