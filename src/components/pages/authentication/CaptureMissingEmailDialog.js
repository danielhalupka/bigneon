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

const styles = {};

class CaptureMissingEmailDialog extends React.Component {
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

		const { email } = this.state;
		const { onSuccess } = this.props;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		Bigneon()
			.users.update({ email })
			.then(() => {
				onSuccess();
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Capturing email address failed.",
					error
				});
			});
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { email } = this.state;

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
		const { open, classes } = this.props;
		const { email, isSubmitting, errors } = this.state;

		return (
			<Dialog
				open={open}
				title="Email address"
				iconUrl={"/icons/link-white.svg"}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<div>
						<Typography>
							Last step, we just need to confirm your email.
						</Typography>
						<InputGroup
							error={errors.email}
							value={email}
							name="email"
							label="Email address"
							type="text"
							onChange={e => this.setState({ email: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
						<div>
							<Button type="submit" variant="callToAction" style={{ width: "100%" }}>
								{isSubmitting ? "Updating..." : "Continue"}
							</Button>
						</div>
					</div>
				</form>
			</Dialog>
		);
	}
}

CaptureMissingEmailDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(CaptureMissingEmailDialog);
