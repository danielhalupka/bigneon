import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";

const styles = theme => ({});

class InviteDecline extends Component {
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

		if (!security_token) {
			notifications.show({
				message: "Missing invite token.",
				variant: "error"
			});
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
		const { isSubmitting, security_token } = this.state;

		if (!security_token) {
			return null;
		}

		return (
			<div>
				<Typography variant="display2">
					Are you sure you want to decline the invite?
				</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Button
							disabled={isSubmitting}
							onClick={this.declineInvite.bind(this)}
						>
							{isSubmitting ? "Declining..." : "Decline"}
						</Button>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(InviteDecline);
