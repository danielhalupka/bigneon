import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { DialogContent, DialogContentText } from "@material-ui/core";

import Button from "../../elements/Button";
import DialogTransition from "../../common/DialogTransition";
import FacebookButton from "./social/FacebookButton";
import Divider from "../../common/Divider";
import LoginForm from "../authentication/forms/LoginForm";
import SignupForm from "../authentication/forms/SignupForm";

const styles = {
	dialogTitle: {
		textAlign: "center"
	},
	changeStateText: {
		textAlign: "center",
		cursor: "pointer",
		marginBottom: 40
	}
};

//If a user is trying to do something that requires authentication first
//A modal version of the signup/login page
class RequiresAuthDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isNewUser: null //They haven't selected signup or login yet
		};

		this.onClose = this.onClose.bind(this);
		this.onSuccess = this.onSuccess.bind(this);
	}

	onClose() {
		this.props.onClose();
		this.setState({ isNewUser: null });
	}

	onSuccess() {
		this.onClose();
		this.props.onAuthSuccess();
	}

	renderContent() {
		const { onClose, classes } = this.props;
		const { isNewUser } = this.state;

		if (isNewUser === true) {
			return (
				<div>
					<DialogTitle className={classes.dialogTitle} id="dialog-title">
						Create a free account
					</DialogTitle>

					<DialogContent>
						<DialogContentText
							onClick={() => this.setState({ isNewUser: false })}
							className={classes.changeStateText}
						>
							Already have an account?
						</DialogContentText>
						<SignupForm onSuccess={this.onSuccess} />
					</DialogContent>
				</div>
			);
		}

		if (isNewUser === false) {
			return (
				<div>
					<DialogTitle className={classes.dialogTitle} id="dialog-title">
						Login to your bigNEON account
					</DialogTitle>

					<DialogContent>
						<DialogContentText
							onClick={() => this.setState({ isNewUser: true })}
							className={classes.changeStateText}
						>
							New here? Create a free account.
						</DialogContentText>
						<LoginForm onSuccess={this.onSuccess} />
					</DialogContent>
				</div>
			);
		}

		return (
			<div>
				<DialogTitle className={classes.dialogTitle} id="dialog-title">
					Create a free bigNEON account
				</DialogTitle>

				<DialogContent>
					<DialogContentText
						onClick={() => this.setState({ isNewUser: false })}
						className={classes.changeStateText}
					>
						Already have an account?
					</DialogContentText>

					<FacebookButton onSuccess={this.onSuccess} />

					<Divider style={{ marginTop: 20, marginBottom: 20 }}> or </Divider>

					<Button
						style={{ width: "100%" }}
						onClick={() => this.setState({ isNewUser: true })}
					>
						Sign up with email
					</Button>
				</DialogContent>
			</div>
		);
	}

	render() {
		const { open } = this.props;

		return (
			<Dialog
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
				TransitionComponent={DialogTransition}
				open={open}
				onClose={this.onClose}
				aria-labelledby="dialog-title"
			>
				{this.renderContent()}
			</Dialog>
		);
	}
}

RequiresAuthDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onAuthSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(RequiresAuthDialog);
