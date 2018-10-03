import React, { Component } from "react";
import { withStyles } from "@material-ui/core";

import Container from "./Container";
import user from "../../../stores/user";
import SignupForm from "./forms/SignupForm";

const styles = () => ({});

class Signup extends Component {
	componentDidMount() {
		user.refreshUser(() => {
			//Already logged, make them go home
			this.props.history.push("/");
		});
	}

	render() {
		return (
			<Container>
				<SignupForm
					onSuccess={(href = "/") => this.props.history.push(href)} //Can optionally change where to redirect to
					showLoginLink
				/>
			</Container>
		);
	}
}

export default withStyles(styles)(Signup);
