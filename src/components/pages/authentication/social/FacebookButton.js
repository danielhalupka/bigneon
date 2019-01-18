import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";

import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import user from "../../../../stores/user";
import Bigneon from "../../../../helpers/bigneon";

const styles = theme => ({
	leftIcon: {
		marginRight: theme.spacing.unit
	},
	iconSmall: {
		height: 22,
		marginBottom: 2
	}
});

class FacebookButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authenticated: false,
			isAuthenticating: false
		};
	}

	onFBSignIn(response) {
		const { status, authResponse } = response;
		const authenticated = status === "connected";
		this.setState({ authenticated });

		if (authenticated) {
			Bigneon()
				.external.facebookLogin(authResponse)
				.then(response => {
					this.setState({ isAuthenticating: false });

					const { access_token, refresh_token } = response.data;
					if (access_token) {
						localStorage.setItem("access_token", access_token);
						localStorage.setItem("refresh_token", refresh_token);

						//Pull user data with our new token
						user.refreshUser(() => {
							this.props.onSuccess();
						});
					} else {
						notifications.show({
							message: "Missing token.",
							variant: "error"
						});
					}
				})
				.catch(error => {
					//If facebook was successful but retrieving our token fails
					this.fbLogout();
					this.setState({ isAuthenticating: false });
					console.error(error);

					let message = "Sign in failed.";
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
	}

	fbLogout() {
		window.FB.logout(this.onFBSignIn.bind(this));
	}

	componentDidMount() {
		//Setup facebook auth
		window.fbAsyncInit = function() {
			window.FB.init({
				appId: process.env.REACT_APP_FACEBOOK_APP_ID,
				xfbml: true,
				version: "v3.1"
			});
			window.FB.AppEvents.logPageView();

			window.FB.getLoginStatus(this.onFBSignIn.bind(this));
		}.bind(this);

		(function(d, s, id) {
			const fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			const js = d.createElement(s);
			js.id = id;
			js.src = "https://connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		})(document, "script", "facebook-jssdk");
	}

	render() {
		const { classes, children } = this.props;
		const { authenticated, isAuthenticating } = this.state;

		let text = children || "Continue with facebook";
		let style = { background: "#4267B2", color: "white" };
		let onClick = () => {
			this.setState({ isAuthenticating: true });
			window.FB.login(this.onFBSignIn.bind(this), { scope: "email" });
		};

		if (authenticated) {
			text = "Logout";
			onClick = () => {
				this.setState({ isAuthenticating: true });
				this.fbLogout();
			};
		}

		if (isAuthenticating) {
			style = null;
		}

		return (
			<Button
				size="large"
				style={{ ...style, width: "100%" }}
				onClick={onClick}
				disabled={isAuthenticating}
			>
				<img
					className={classNames(classes.leftIcon, classes.iconSmall)}
					src={"/images/social/facebook-icon-white.svg"}
				/>
				{text}
			</Button>
		);
	}
}

FacebookButton.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string,
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(FacebookButton);
