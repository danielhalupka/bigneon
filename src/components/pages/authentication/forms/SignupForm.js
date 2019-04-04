import React, { Component } from "react";
import { withStyles, Grid, Typography } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import PropTypes from "prop-types";

import Recaptcha from "../../../common/Recaptcha";
import InputGroup from "../../../common/form/InputGroup";
import Button from "../../../elements/Button";
import user from "../../../../stores/user";
import notifications from "../../../../stores/notifications";
import { validEmail, validPhone, validPassword } from "../../../../validators";
import { FacebookButton } from "../social/FacebookButton";
import Divider from "../../../common/Divider";
import Bigneon from "../../../../helpers/bigneon";
import removePhoneFormatting from "../../../../helpers/removePhoneFormatting";
import StyledLink from "../../../elements/StyledLink";
import analytics from "../../../../helpers/analytics";

const styles = theme => ({
	privacy: {
		fontSize: theme.typography.fontSize * 0.8,
		marginBottom: theme.spacing.unit
	}
});

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
			recaptchaResponse: null,
			isSubmitting: false,
			errors: {}
		};

		this.handleRecaptchaVerify = this.handleRecaptchaVerify.bind(this);
		this.handleRecaptchaExpire = this.handleRecaptchaExpire.bind(this);
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
			password,
			confirmPassword
		} = this.state;

		//const phone = removePhoneFormatting(this.state.phone);

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

		// if (!phone) {
		// 	errors.phone = "Missing phone number.";
		// } else if (!validPhone(phone)) {
		// 	errors.phone = "Invalid phone number.";
		// }

		if (!password) {
			errors.password = "Missing password.";
		} else if (!validPassword(password)) {
			errors.password = "Password needs to be at least 6 characters.";
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

	handleRecaptchaVerify(response) {
		this.setState({ recaptchaResponse: response });
	}

	handleRecaptchaExpire() {
		this.setState({ recaptchaResponse: null });
	}

	onSignupSuccess({ email, password, recaptchaResponse }) {
		const params = {
			email,
			password
		};

		if (recaptchaResponse) {
			params["g-recaptcha-response"] = recaptchaResponse;
		}
		//Successful signup, now get a token
		Bigneon()
			.auth.authenticate(params)
			.then(response => {
				const { access_token, refresh_token } = response.data;
				if (access_token) {
					localStorage.setItem("access_token", access_token);
					localStorage.setItem("refresh_token", refresh_token);

					//Pull user data with our new token
					user.refreshUser((newUser) => {
						analytics.identify({ ...newUser, method: "signup" });

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

		const {
			first_name,
			last_name,
			email,
			phone,
			password,
			recaptchaResponse
		} = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		const params = {
			first_name,
			last_name,
			email,
			//phone,
			password
		};

		if (recaptchaResponse) {
			params["g-recaptcha-response"] = recaptchaResponse;
		}

		Bigneon()
			.users.create(params)
			.then(response => {
				this.onSignupSuccess({ email, password, recaptchaResponse });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.showFromErrorResponse({
					defaultMessage: "Sign up failed.",
					error
				});
			});
	}

	render() {
		const {
			first_name,
			last_name,
			email,
			//phone,
			password,
			confirmPassword,
			isSubmitting,
			errors
		} = this.state;

		const { classes } = this.props;

		return (
			<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
				<div>
					<Grid container spacing={8}>
						{process.env.REACT_APP_FACEBOOK_APP_ID ?  (
							<Grid item xs={12} sm={12} lg={12}>
								<FacebookButton onSuccess={this.props.onSuccess}/>
								<Divider style={{ marginTop: 40, marginBottom: 0 }}>Or</Divider>
							</Grid>
						) : null}

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
						{/* <Grid item xs={12} sm={12} lg={12}>
							<InputGroup
								error={errors.phone}
								value={phone}
								name="phone"
								label="Phone number"
								type="phone"
								onChange={e => this.setState({ phone: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid> */}
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
						<Grid item xs={12} sm={12} lg={12}>
							<Recaptcha
								callback={this.handleRecaptchaVerify}
								expiredCallback={this.handleRecaptchaExpire}
							/>
						</Grid>
					</Grid>
				</div>
				<br/>
				<div>
					<Typography className={classes.privacy}>
						By signing up I agree to BigNeon's{" "}
						<StyledLink underlined thin href="/terms.html" target="_blank">
							terms of service
						</StyledLink>{" "}
							&{" "}
						<StyledLink
							underlined
							thin
							href="/privacy.html"
							target="_blank"
						>
							privacy policy
						</StyledLink>
					</Typography>

					<Button
						disabled={isSubmitting}
						type="submit"
						style={{ marginRight: 10, width: "100%" }}
						variant="callToAction"
					>
						{isSubmitting ? "Submitting..." : <span>Create</span>}
					</Button>
				</div>
			</form>
		);
	}
}

SignupForm.propTypes = {
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(SignupForm);
