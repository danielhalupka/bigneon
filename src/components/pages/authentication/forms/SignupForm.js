import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withStyles, Grid } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import PropTypes from "prop-types";

import InputGroup from "../../../common/form/InputGroup";
import Button from "../../../common/Button";
import user from "../../../../stores/user";
import notifications from "../../../../stores/notifications";
import { validEmail, validPhone } from "../../../../validators";
import FacebookButton from "../social/FacebookButton";
import Divider from "../../../common/Divider";
import Bigneon from "../../../../helpers/bigneon";

const styles = () => ({});

class SignupForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			first_name: "",
			last_name: "",
			email: "",
			phone: "",
			password: "",
			confirmPassword: "",
			isSubmitting: false,
			errors: {}
		};
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const {
			first_name,
			last_name,
			email,
			phone,
			password,
			confirmPassword
		} = this.state;

		const errors = {};

		if (!first_name) {
			errors.first_name = "Missing first name.";
		}

		if (!last_name) {
			errors.last_name = "Missing last name.";
		}

		if (!email) {
			errors.email = "Missing email.";
		} else if (!validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		if (!phone) {
			errors.phone = "Missing phone number.";
		} else if (!validPhone(phone)) {
			errors.phone = "Invalid phone number.";
		}

		if (!password) {
			errors.password = "Missing password.";
		}

		if (!confirmPassword) {
			errors.confirmPassword = "Missing confirm password.";
		} else if (password !== confirmPassword) {
			errors.confirmPassword = "Make sure the passwords match.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSignupSuccess({ email, password }) {
		//Successful signup, now get a token
		Bigneon()
			.auth.authenticate({
				email,
				password
			})
			.then(response => {
				const { access_token, refresh_token } = response.data;
				if (access_token) {
					localStorage.setItem("access_token", access_token);
					localStorage.setItem("refresh_token", refresh_token);

					//Pull user data with our new token
					user.refreshUser(() => {
						//If we have a security token, send them to the accept invite page first
						const security_token = localStorage.getItem("security_token");
						if (security_token) {
							this.props.onSuccess(`/invites/accept?token=${security_token}`);
						} else {
							this.props.onSuccess();
						}
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
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Signup failed.";
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

	onSubmit(e) {
		e.preventDefault();

		const { first_name, last_name, email, phone, password } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		Bigneon()
			.users.create({
				first_name,
				last_name,
				email,
				phone,
				password
			})
			.then(response => {
				this.onSignupSuccess({ email, password });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				let message = "Sign up failed.";
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

	render() {
		const {
			first_name,
			last_name,
			email,
			phone,
			password,
			confirmPassword,
			isSubmitting,
			errors
		} = this.state;
		const { showLoginLink } = this.props;

		return (
			<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
				<CardContent>
					<Grid container spacing={8}>
						<Grid item xs={12} sm={12} lg={12}>
							<FacebookButton onSuccess={this.props.onSuccess} />
							<Divider style={{ marginTop: 40, marginBottom: 0 }}>Or</Divider>
						</Grid>

						<Grid item xs={12} sm={12} lg={6}>
							<InputGroup
								error={errors.first_name}
								value={first_name}
								name="first_name"
								label="First name"
								type="text"
								onChange={e => this.setState({ first_name: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} lg={6}>
							<InputGroup
								error={errors.last_name}
								value={last_name}
								name="last_name"
								label="Last name"
								type="text"
								onChange={e => this.setState({ last_name: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} lg={12}>
							<InputGroup
								error={errors.email}
								value={email}
								name="email"
								label="Email address"
								type="text"
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} lg={12}>
							<InputGroup
								error={errors.phone}
								value={phone}
								name="phone"
								label="Phone number"
								type="text"
								onChange={e => this.setState({ phone: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} lg={12}>
							<InputGroup
								error={errors.password}
								value={password}
								name="password"
								label="Password"
								type="password"
								onChange={e => this.setState({ password: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} lg={12}>
							<InputGroup
								error={errors.confirmPassword}
								value={confirmPassword}
								name="confirmPassword"
								label="Confirm password"
								type="password"
								onChange={e =>
									this.setState({ confirmPassword: e.target.value })
								}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
					</Grid>
				</CardContent>
				<CardActions>
					<Grid container spacing={24}>
						<Grid item xs={12} sm={12} lg={12}>
							<Button
								disabled={isSubmitting}
								type="submit"
								style={{ marginRight: 10, width: "100%" }}
								customClassName="callToAction"
							>
								{isSubmitting ? "Submitting..." : <span>Sign&nbsp;up</span>}
							</Button>
						</Grid>

						{showLoginLink ? (
							<Grid item xs={12} sm={12} lg={12}>
								<Link to={"/login"} style={{ textDecoration: "none" }}>
									<Button style={{ width: "100%" }} disabled={isSubmitting}>
										I already have an account
									</Button>
								</Link>
							</Grid>
						) : null}
					</Grid>
				</CardActions>
			</form>
		);
	}
}

SignupForm.propTypes = {
	onSuccess: PropTypes.func.isRequired,
	showLoginLink: PropTypes.bool
};

export default withStyles(styles)(SignupForm);
