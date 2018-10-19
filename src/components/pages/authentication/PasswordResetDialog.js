import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import {
	DialogContent,
	DialogContentText,
	DialogActions
} from "@material-ui/core";

import InputGroup from "../../common/form/InputGroup";
import { validEmail } from "../../../validators";
import notifications from "../../../stores/notifications";
import Button from "../../elements/Button";
import DialogTransition from "../../common/DialogTransition";
import Bigneon from "../../../helpers/bigneon";

const styles = {};

class PasswordResetDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			errors: {},
			isSubmitting: false
		};
	}

	onSubmit(e) {
		e.preventDefault();

		const email = this.state.email || this.props.email; //If they haven't edited the email then it's still in the props
		const { onClose } = this.props;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		console.log("Go");

		Bigneon()
			.passwordReset.create({
				email
			})
			.then(response => {
				const { message } = response.data;

				notifications.show({
					message,
					variant: "success"
				});
				this.setState({ isSubmitting: false });

				onClose();
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Password reset failed.";
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

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const email = this.state.email || this.props.email; //If they haven't edited the email then it's still in the props

		const errors = {};

		if (!email) {
			errors.email = "Missing email address.";
		}

		if (!validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	render() {
		const { onClose, open } = this.props;
		const { email, isSubmitting, errors } = this.state;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				open={open}
				onClose={onClose}
				aria-labelledby="simple-dialog-title"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<DialogTitle id="simple-dialog-title">Reset password</DialogTitle>

					<DialogContent>
						<DialogContentText>
							We'll send you a link to reset your password.
						</DialogContentText>
						<InputGroup
							error={errors.email}
							value={email || this.props.email}
							name="email"
							label="Email address"
							type="text"
							onChange={e => this.setState({ email: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
					</DialogContent>
					<DialogActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={onClose}
							color="primary"
						>
							Cancel
						</Button>
						<Button type="submit" customClassName="callToAction">
							{isSubmitting ? "Resetting..." : "Reset password"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
}

PasswordResetDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	email: PropTypes.string
};

export default withStyles(styles)(PasswordResetDialog);
