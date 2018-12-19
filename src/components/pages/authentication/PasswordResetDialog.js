import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import InputGroup from "../../common/form/InputGroup";
import { validEmail } from "../../../validators";
import notifications from "../../../stores/notifications";
import Button from "../../elements/Button";
import Bigneon from "../../../helpers/bigneon";
import Dialog from "../../elements/Dialog";
import { Typography } from "@material-ui/core";

const styles = {
	actionButtons: {
		display: "flex",
		justifyContent: "space-between"
	}
};

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
		const { onClose, open, classes } = this.props;
		const { email, isSubmitting, errors } = this.state;

		return (
			<Dialog
				open={open}
				onClose={onClose}
				title="Reset password"
				iconUrl={"/icons/link-white.svg"}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<div>
						<Typography>
							We'll send you a link to reset your password.
						</Typography>
						<InputGroup
							error={errors.email}
							value={email || this.props.email}
							name="email"
							label="Email address"
							type="text"
							onChange={e => this.setState({ email: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
						<div className={classes.actionButtons}>
							<Button onClick={onClose} color="primary">
								Cancel
							</Button>
							<Button type="submit" variant="callToAction">
								{isSubmitting ? "Resetting..." : "Reset password"}
							</Button>
						</div>
					</div>
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
