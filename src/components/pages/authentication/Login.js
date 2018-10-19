import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

import Container from "./Container";
import LoginForm from "./forms/LoginForm";
import user from "../../../stores/user";
import Button from "../../elements/Button";

class Login extends Component {
	componentDidMount() {
		user.refreshUser(() => {
			//Already logged in, make them go home
			this.props.history.push("/");
		});
	}

	render() {
		return (
			<Container {...this.props} type="login" heading="Login to your account">
				<Typography variant="headline">Login to your account</Typography>
				<Link to="/sign-up">
					<Button variant="text">New here? Create a free account.</Button>
				</Link>
				<LoginForm onSuccess={() => this.props.history.push("/")} />
			</Container>
		);
	}
}

export default Login;
