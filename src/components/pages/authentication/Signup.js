import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

import Container from "./Container";
import user from "../../../stores/user";
import SignupForm from "./forms/SignupForm";
import Button from "../../elements/Button";
import Meta from "./Meta";

class Signup extends Component {
	componentDidMount() {
		user.refreshUser(() => {
			//Already logged, make them go home
			this.props.history.push("/");
		});
	}

	render() {
		return (
			<Container {...this.props} type="signup">
				<Meta type="sign-up" />
				<Typography variant="headline">Create your account</Typography>
				<Link to="/login">
					<Button variant="text">Already have an account?</Button>
				</Link>
				<SignupForm
					onSuccess={(href = "/") => this.props.history.push(href)} //Can optionally change where to redirect to
				/>
			</Container>
		);
	}
}

export default Signup;
