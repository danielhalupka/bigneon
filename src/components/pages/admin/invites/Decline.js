import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";
import Dialog from "../../../elements/Dialog";

const styles = theme => ({});

class InviteDecline extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false,
			security_token: null,
			showDeclineDialog: false
		};
	}

	componentDidMount() {
		const url = new URL(window.location.href);
		const security_token = url.searchParams.get("token") || "";

		this.setState({ security_token });

		if (!security_token) {
			notifications.show({
				message: "Missing invite token.",
				variant: "error"
			});
		} else {
			this.setState({ showDeclineDialog: true });
		}
	}

	declineInvite() {
		this.setState({ isSubmitting: true });

		const { security_token } = this.state;

		Bigneon()
			.invitations.accept({ security_token })
			.then(response => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Invite declined.",
					variant: "success"
				});

				this.props.history.push(`/`);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Declining invite failed.",
					variant: "error"
				});
			});
	}

	render() {
		const { isSubmitting, security_token, showDeclineDialog } = this.state;

		if (!security_token) {
			return null;
		}

		return (
			<div>
				<Dialog
					iconUrl={"/icons/delete-white.svg"}
					title={"Decline invite"}
					open={showDeclineDialog}
				>
					<Typography>Are you sure you want to decline the invite?</Typography>
					<div style={{ paddingTop: 40, textAlign: "center" }}>
						<Button
							disabled={isSubmitting}
							onClick={this.declineInvite.bind(this)}
						>
							Decline
						</Button>
					</div>
				</Dialog>
			</div>
		);
	}
}

export default withStyles(styles)(InviteDecline);
