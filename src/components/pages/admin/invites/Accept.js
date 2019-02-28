import React, { Component } from "react";
import { withStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import user from "../../../../stores/user";
import Bigneon from "../../../../helpers/bigneon";
import Dialog from "../../../elements/Dialog";
import Button from "../../../elements/Button";
import { fontFamilyDemiBold } from "../../../styles/theme";

const styles = theme => ({
	text: { textAlign: "center" },
	bold: { fontFamily: fontFamilyDemiBold },
	actionButtonContainer: {
		paddingTop: 40,
		display: "flex"
	}
});

@observer
class InviteAccept extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showSuccessDialog: false,
			errorMessage: "",
			showRedirectDialog: false,
			showAcceptDialog: false,
			orgName: "",
			orgInviterName: ""
		};

		const url = new URL(window.location.href);
		this.security_token = url.searchParams.get("token") || "";
	}

	componentDidMount() {
		if (this.security_token) {
			this.readInviteDetails(() => {
				//Check if we're logged in, if we are accept the invite. If not send them to register first.
				user.refreshUser(
					user => {
						this.setState({ showAcceptDialog: true });
					},
					() => {
						this.setState({ showRedirectDialog: true });
					}
				);
			});
		} else {
			this.setState({ errorMessage: "Missing invite token." });
		}
	}

	readInviteDetails(onSuccess) {
		Bigneon()
			.invitations.read({ security_token: this.security_token })
			.then(response => {
				const { inviter_name, organization_name } = response.data;

				this.setState({
					orgName: organization_name,
					orgInviterName: inviter_name
				});

				onSuccess();
			})
			.catch(error => {
				console.error(error);
				let errorMessage = "Accepting invite failed.";

				if (error && error.response && error.response.status === 404) {
					errorMessage = "Invite does not exist or has already been accepted.";
					//If the invite isn't there, remove the token or it'll show up on each login
					localStorage.removeItem("security_token");
				}
				this.setState({ errorMessage });
			});
	}

	goToAuthFirst(route = "/sign-up") {
		//Save the token, then take them to the signup page
		localStorage.setItem("security_token", this.security_token);

		this.props.history.push(route);
	}

	goToLoginFirst() {
		//Save the token, then take them to the login page
		localStorage.setItem("security_token", this.security_token);

		this.props.history.push(`/login`);
	}

	acceptInvite() {
		Bigneon()
			.invitations.accept({ security_token: this.security_token })
			.then(response => {
				user.refreshUser();
				localStorage.removeItem("security_token");
				this.setState({
					showSuccessDialog: true,
					showAcceptDialog: false
				});
			})
			.catch(error => {
				console.error(error);

				let errorMessage = "Accepting invite failed.";

				if (error && error.response && error.response.status === 404) {
					errorMessage = "Invite does not exist or has already been accepted";
				}
				this.setState({ errorMessage });
			});
	}

	renderOrgDetails() {
		const { orgName, orgInviterName } = this.state;
		const { classes } = this.props;

		return orgName && orgInviterName ? (
			<Typography className={classes.text}>
				You've been invited by{" "}
				<span className={classes.bold}>{orgInviterName}</span> to join{" "}
				<span className={classes.bold}>{orgName}</span>.
			</Typography>
		) : null;
	}

	renderUserEmail() {
		const { email } = user;
		const { classes } = this.props;

		if (email) {
			return <Typography className={classes.text}>Currently logged in as: <span className={classes.bold}>{email}</span>.</Typography>;
		}

		return null;
	}

	render() {
		const {
			showSuccessDialog,
			errorMessage,
			showRedirectDialog,
			showAcceptDialog
		} = this.state;
		const { classes } = this.props;

		let boxOfficeLink;
		if (user.isOnlyDoorPerson) {
			boxOfficeLink = "/box-office/guests";
		} else if (user.isOnlyDoorPersonOrBoxOffice) {
			boxOfficeLink = "/box-office/sell";
		}

		return (
			<div>
				{/* Final button to accept the invite */}
				<Dialog
					iconUrl={"/icons/link-white.svg"}
					title={"Organization invite"}
					open={showAcceptDialog}
				>
					{this.renderOrgDetails()}
					{this.renderUserEmail()}

					<div style={{ paddingTop: 40 }}>
						<Button
							variant="callToAction"
							onClick={this.acceptInvite.bind(this)}
							style={{ width: "100%" }}
						>
							Accept invite
						</Button>

						<Button
							onClick={() => {
								user.onLogout();
								this.goToLoginFirst();
							}}
							style={{ width: "100%", marginTop: 10 }}
						>
							Logout and switch account
						</Button>
					</div>
				</Dialog>

				{/* If they clicked the link and need to be redirected */}
				<Dialog
					iconUrl={"/icons/link-white.svg"}
					title={"Organization invite"}
					open={showRedirectDialog}
				>
					{this.renderOrgDetails()}

					<Typography className={classes.text}>
						Please signup to accept the invite.
					</Typography>

					<div className={classes.actionButtonContainer}>
						<Button
							onClick={() => this.goToAuthFirst("/login")}
							style={{ flex: 1, marginRight: 5 }}
						>
							Login
						</Button>

						<Button
							variant="callToAction"
							onClick={() => this.goToAuthFirst("/sign-up")}
							style={{ flex: 1, marginLeft: 5 }}
						>
							Sign up
						</Button>
					</div>
				</Dialog>

				{/* If the accepting failed */}
				<Dialog
					iconUrl={"/icons/delete-white.svg"}
					title={"Invalid invite"}
					open={!!errorMessage}
				>
					<Typography className={classes.text}>{errorMessage}</Typography>
					<div style={{ paddingTop: 40 }}>
						<Link to="/">
							<Button style={{ width: "100%" }} variant="callToAction">
								Home
							</Button>
						</Link>
					</div>
				</Dialog>

				{/* If they successfully accepted */}
				<Dialog
					iconUrl={"/icons/checkmark-white.svg"}
					title={"Invite accepted"}
					open={showSuccessDialog}
				>
					<div style={{ paddingTop: 40 }}>
						{boxOfficeLink ? (
							<Link to={boxOfficeLink}>
								<Button style={{ width: "100%" }} variant="callToAction">
									Visit box office
								</Button>
							</Link>
						) : (
							<Link to="/admin/events">
								<Button style={{ width: "100%" }} variant="callToAction">
									Visit admin dashboard
								</Button>
							</Link>
						)}
					</div>
				</Dialog>
			</div>
		);
	}
}

export default withStyles(styles)(InviteAccept);
