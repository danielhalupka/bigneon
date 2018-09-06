import React, { Component } from "react";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import InputGroup from "../../common/form/InputGroup";
import Button from "../../common/Button";
import Container from "./Container";
import notifications from "../../../stores/notifications";
import api from "../../../helpers/api";
import user from "../../../stores/user";

const styles = () => ({});

@observer
class PasswordReset extends Component {
	constructor(props) {
		super(props);

		this.state = {
			password: "",
			confirmPassword: "",
			isSubmitting: false,
			errors: {},
			resetOpen: false,
			password_reset_token: ""
		};
	}

	componentDidMount() {
		const url = new URL(window.location.href);
		const password_reset_token = url.searchParams.get("token") || "";

		this.setState({ password_reset_token });
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { password, confirmPassword } = this.state;

		const errors = {};

		if (!password) {
			errors.password = "Missing password.";
		}

		if (!confirmPassword) {
			errors.confirmPassword = "Missing password confirmation.";
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = "Please make sure passwords match.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		const { password, password_reset_token } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		api({
			auth: false
		})
			.put("/password_reset", {
				password,
				password_reset_token
			})
			.then(response => {
				const { access_token, refresh_token } = response.data;

				if (access_token) {
					localStorage.setItem("access_token", access_token);
					localStorage.setItem("refresh_token", refresh_token);

					//Pull user data with our new token
					user.refreshUser(() => {
						this.props.history.push("/dashboard");
					});
				} else {
					this.setState({ isSubmitting: false });

					notifications.show({
						message: "Missing token.",
						variant: "error"
					});
				}
			})
			.catch(error => {
				let message = "Password reset failed.";

				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}
				this.setState({ isSubmitting: false });
				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	render() {
		const { password, confirmPassword, isSubmitting, errors } = this.state;

		return (
			<Container>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<InputGroup
							error={errors.password}
							value={password}
							name="password"
							label="New password"
							type="password"
							onChange={e => this.setState({ password: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>

						<InputGroup
							error={errors.confirmPassword}
							value={confirmPassword}
							name="confirmPassword"
							label="Confirm new password"
							type="password"
							onChange={e => this.setState({ confirmPassword: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
					</CardContent>
					<CardActions>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Resseting..." : "Rest"}
						</Button>
					</CardActions>
				</form>
			</Container>
		);
	}
}

export default withStyles(styles)(PasswordReset);
