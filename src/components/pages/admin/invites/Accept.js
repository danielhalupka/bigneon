import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

import notifications from "../../../../stores/notifications";
import user from "../../../../stores/user";
import Bigneon from "../../../../helpers/bigneon";
import Dialog from "../../../elements/Dialog";
import Button from "../../../elements/Button";
import PageHeading from "../../../elements/PageHeading";

const styles = theme => ({});

class InviteAccept extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false,
			security_token: null,
			showSuccessDialog: true
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

		Bigneon()
			.invitations.accept({ security_token })
			.then(response => {
				this.setState({ isSubmitting: false, showSuccessDialog: true });

				user.refreshUser();
				localStorage.removeItem("security_token");
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.showFromErrorResponse({
					defaultMessage: "Accepting invite failed.",
					error
				});
			});
	}

	render() {
		const { isSubmitting, showSuccessDialog } = this.state;

		return (
			<div>
				<PageHeading>
					{isSubmitting ? "Accepting invite..." : "Invitation"}
				</PageHeading>

				<Dialog
					iconUrl={"/icons/checkmark-white.svg"}
					title={`Invite accepted`}
					open={showSuccessDialog}
				>
					<div style={{ paddingTop: 40 }}>
						<Link to="/admin/events">
							<Button variant="callToAction">Visit admin dashboard</Button>
						</Link>
					</div>
				</Dialog>
			</div>
		);
	}
}

export default withStyles(styles)(InviteAccept);
