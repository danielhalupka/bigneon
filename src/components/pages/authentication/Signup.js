import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Typography, withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import InputGroup from "../../common/form/InputGroup";
import Button from "../../common/Button";
import Container from "./Container";
import user from "../../../stores/user";
import notifications from "../../../stores/notifications";
import { validEmail, validPhone } from "../../../validators";
import api from "../../../helpers/api";

const styles = () => ({});

class Signup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
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

		const { name, email, phone, password, confirmPassword } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing name.";
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

	onSubmit(e) {
		e.preventDefault();

		const { name, email, phone, password } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		console.log({
			name,
			email,
			phone,
			password
		});

		api({
			auth: false
		})
			.post("/users/register", {
				name,
				email,
				phone,
				password
			})
			.then(response => {
				console.log(response);

				const { token } = response.data;
				if (token) {
					user.refreshUser(() => {
						this.props.history.push("/dashboard");
					});
				} else {
					notifications.show({
						message: "Missing token.",
						variant: "error"
					});
				}
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Sign up failed.", //TODO add more details here
					variant: "error"
				});
			});
	}

	render() {
		const {
			name,
			email,
			phone,
			password,
			confirmPassword,
			isSubmitting,
			errors
		} = this.state;

		return (
			<Container>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<Typography gutterBottom variant="headline" component="h2">
							Sign up
						</Typography>

						<InputGroup
							error={errors.name}
							value={name}
							name="name"
							label="Name"
							type="text"
							onChange={e => this.setState({ name: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
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
							error={errors.phone}
							value={phone}
							name="phone"
							label="Phone number"
							type="text"
							onChange={e => this.setState({ phone: e.target.value })}
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
						<InputGroup
							error={errors.confirmPassword}
							value={confirmPassword}
							name="confirmPassword"
							label="Confirm password"
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
							{isSubmitting ? "Submitting..." : <span>Sign&nbsp;up</span>}
						</Button>

						<Link to={"/login"} style={{ textDecoration: "none" }}>
							<Button disabled={isSubmitting}>I already have an account</Button>
						</Link>
					</CardActions>
				</form>
			</Container>
		);
	}
}

export default withStyles(styles)(Signup);
