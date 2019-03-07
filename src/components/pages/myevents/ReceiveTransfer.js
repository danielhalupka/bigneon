import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";

import notifications from "../../../stores/notifications";
import user from "../../../stores/user";
import Bigneon from "../../../helpers/bigneon";
import { observer } from "mobx-react";
import getUrlParam from "../../../helpers/getUrlParam";

const styles = theme => ({});

@observer
class ReceiveTransfer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false,
			transferAuth: null
		};
	}

	componentDidMount() {
		const transferAuth = {
			transfer_key: getUrlParam("transfer_key"),
			sender_user_id: getUrlParam("sender_user_id"),
			num_tickets: parseInt(getUrlParam("num_tickets")),
			signature: getUrlParam("signature")
		};

		this.setState({ transferAuth });

		//If we just landed on this page, make sure the user is logged in first
		user.refreshUser(() => this.receiveTransfer(), () => this.attemptReceive());
	}

	attemptReceive() {
		if (!user.isAuthenticated) {
			//Show dialog for the user to signup/login, try again when they're authenticated
			user.showAuthRequiredDialog(this.receiveTransfer.bind(this));
			return;
		}

		this.receiveTransfer();
	}

	receiveTransfer() {
		this.setState({ isSubmitting: true });
		const { transferAuth } = this.state;

		Bigneon()
			.tickets.transfer.receive(transferAuth)
			.then(response => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Tickets received.",
					variant: "success"
				});

				localStorage.removeItem("transferAuth");
				this.props.history.push(`/my-events`);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.showFromErrorResponse({
					defaultMessage: "Receiving tickets failed.",
					error
				});
			});
	}

	render() {
		const { isSubmitting, transferAuth } = this.state;

		if (!transferAuth) {
			return null;
		}

		return (
			<div>
				<Typography variant="display2">
					{isSubmitting ? "Receiving tickets..." : "Tickets"}
				</Typography>
			</div>
		);
	}
}

export default withStyles(styles)(ReceiveTransfer);
