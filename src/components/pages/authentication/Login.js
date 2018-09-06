import React, {Component} from "react";
import {Link} from "react-router-dom";
import {observer} from "mobx-react";
import {withStyles} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import InputGroup from "../../common/form/InputGroup";
import Button from "../../common/Button";
import Container from "./Container";
import user from "../../../stores/user";
import notifications from "../../../stores/notifications";
import {validEmail} from "../../../validators";
import decodeJWT from "../../../helpers/decodeJWT";
import FacebookButton from "./social/FacebookButton";
import Divider from "../../common/Divider";
import ResetPasswordModal from "./ResetPasswordModal";
import Bigneon from '../../../helpers/bigneon';

const styles = () => ({});

@observer
class Login extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: process.env.NODE_ENV === "development" ? "superuser@test.com" : "",
			password: process.env.NODE_ENV === "development" ? "password" : "",
			confirmPassword: "",
			isSubmitting: false,
			errors: {},
			resetOpen: false
		};
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const {email, password} = this.state;

		const errors = {};

		if (!email) {
			errors.email = "Missing email address.";
		}

		if (!validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		if (!password) {
			errors.password = "Missing password.";
		}

		this.setState({errors});

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		const {email, password} = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({isSubmitting: true});
		Bigneon().auth.create({
			email,
			password
		})
			.then(response => {
				const {access_token, refresh_token} = response.data;
				if (access_token) {
					localStorage.setItem("access_token", access_token);
					localStorage.setItem("refresh_token", refresh_token);

					//Pull user data with our new token
					user.refreshUser(() => {
						this.props.history.push("/dashboard");
					});
				} else {
					this.setState({isSubmitting: false});

					notifications.show({
						message: "Missing token.",
						variant: "error"
					});

				}
			})
			.catch(error => {
				let message = "Login failed.";

				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}
				this.setState({isSubmitting: false});
				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	render() {
    const { email, password, resetOpen, isSubmitting, errors } = this.state;
    
		return (
			<Container>
				<div>
					<ResetPasswordModal
						onClose={() => this.setState({ resetOpen: false })}
						open={resetOpen}
						email={email}
					/>
					<form
						noValidate
						autoComplete="off"
						onSubmit={this.onSubmit.bind(this)}
					>
						<CardContent>
							{/* <Typography gutterBottom variant="headline" component="h2">
							Login
						</Typography> */}
							<FacebookButton
								onSuccess={() => this.props.history.push("/dashboard")}
							>
								Login with Facebook
							</FacebookButton>

							<Divider style={{ marginTop: 40, marginBottom: 0 }}>Or</Divider>

							<InputGroup
								error={errors.email}
								value={email}
								name="email"
								label="Email address"
								type="text"
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
							<InputGroup
								error={errors.password}
								value={password}
								name="password"
								label="Password"
								type="password"
								onChange={e => this.setState({ password: e.target.value })}
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
								{isSubmitting ? "Submitting..." : "Login"}
							</Button>

							<Button
								onClick={() => this.setState({ resetOpen: true })}
								style={{ marginRight: 10 }}
								disabled={isSubmitting}
							>
								Forgot password
							</Button>

							<Link to={"/sign-up"} style={{ textDecoration: "none" }}>
								<Button disabled={isSubmitting}>I don't have an account</Button>
							</Link>
						</CardActions>
					</form>
				</div>

			</Container>
		);
	}
}

export default withStyles(styles)(Login);
