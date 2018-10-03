import React, { Component } from "react";
import { withStyles } from "@material-ui/core";

import Container from "./Container";
import LoginForm from "./forms/LoginForm";
import user from "../../../stores/user";

const styles = () => ({});

class Login extends Component {
	componentDidMount() {
		user.refreshUser(() => {
			//Already logged in, make them go home
			this.props.history.push("/");
		});
	}

	render() {
		return (
			<Container>
				<LoginForm
					onSuccess={() => this.props.history.push("/")}
					showSignupLink
				/>
			</Container>
		);
	}
}

export default withStyles(styles)(Login);
