import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import axios from "axios";
import { Typography, withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import InputGroup from "../../common/form/InputGroup";
import Button from "../../common/Button";
import Container from "./Container";
import user from "../../../stores/user";
import notifications from "../../../stores/notifications";

const styles = () => ({});

@observer
class Login extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: process.env.NODE_ENV === "development" ? "test@test.com" : "",
			password: process.env.NODE_ENV === "development" ? "Test123" : "",
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

		const { email, password } = this.state;

		const errors = {};

		if (!email) {
			errors.email = "Missing email.";
		}

		if (!password) {
			errors.password = "Missing password.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		const { email, password } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		console.log({
			email,
			password
		});

		axios
			.get("https://ce8b7607-3c4d-4e2e-ada0-7b9e3167d03b.mock.pstmn.io/login", {
				params: {
					email
				}
			})
			.then(response => {
				console.log(response);

				user.setDetails({
					id: `new-id${new Date().getTime()}`,
					name: "TODO-name",
					email: "TODO-email",
					phone: "TODO-phone"
				});
				this.props.history.push("/dashboard");
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Login failed.", //TODO add more details here
					variant: "error"
				});
			});
	}

	render() {
		const { email, password, isSubmitting, errors } = this.state;

		return (
			<Container>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<Typography gutterBottom variant="headline" component="h2">
							Login
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

						<Link to={"/sign-up"} style={{ textDecoration: "none" }}>
							<Button disabled={isSubmitting}>I don't have an account</Button>
						</Link>
					</CardActions>
				</form>
			</Container>
		);
	}
}

export default withStyles(styles)(Login);
