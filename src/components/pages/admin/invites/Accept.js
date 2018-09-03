import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";

import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import user from "../../../../stores/user";

const styles = theme => ({});

class InviteAccept extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false,
			security_token: null
		};
	}

	componentDidMount() {
		const url = new URL(window.location.href);
		const security_token = url.searchParams.get("token") || "";

		this.setState({ security_token });

		if (security_token) {
			//Check if we're logged in, if we are accept the invite. If not send them to register first.
			user.refreshUser(
				() => {
					this.acceptInvite();
				},
				() => {
					localStorage.setItem("security_token", security_token);

					//Save the token
					this.props.history.push(`/sign-up`);
				}
			);
		} else {
			notifications.show({
				message: "Missing invite token.",
				variant: "error"
			});
		}
	}

	acceptInvite() {
		this.setState({ isSubmitting: true });

		const { security_token } = this.state;

		api()
			.get(`/organizations/accept_invite`, { params: { security_token } })
			.then(response => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Invite accepted.",
					variant: "success"
				});

				localStorage.removeItem("security_token");
				this.props.history.push(`/dashboard`);
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
		const { isSubmitting, security_token } = this.state;

		if (!security_token) {
			return null;
		}

		return (
			<div>
				<Typography variant="display2">
					{isSubmitting ? "Accepting invite..." : "Invitation"}
				</Typography>
			</div>
		);
	}
}

export default withStyles(styles)(InviteAccept);
