import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Typography, withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import InputGroup from "../../common/form/InputGroup";
import Button from "../../common/Button";
import Container from "./Container";

const styles = theme => ({});

class Signup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			firstName: "",
			lastName: "",
			email: "",
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
			firstName,
			lastName,
			email,
			password,
			confirmPassword
		} = this.state;

		const errors = {};

		if (!firstName) {
			errors.firstName = "Missing first name.";
		}

		if (!lastName) {
			errors.lastName = "Missing last name.";
		}

		if (!email) {
			errors.email = "Missing email.";
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

		const { firstName, lastName, email, password } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		console.log({
			firstName,
			lastName,
			email,
			password
		});

		//TODO remove
		setTimeout(() => {
			this.props.history.push("/dashboard");
		}, 2000);
	}

	render() {
		const {
			firstName,
			lastName,
			email,
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
							error={errors.firstName}
							value={firstName}
							name="firstName"
							label="First name"
							type="text"
							onChange={e => this.setState({ firstName: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
						<InputGroup
							error={errors.lastName}
							value={lastName}
							name="lastName"
							label="Last name"
							type="text"
							onChange={e => this.setState({ lastName: e.target.value })}
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
							{isSubmitting ? "Submitting..." : "Sign up"}
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
