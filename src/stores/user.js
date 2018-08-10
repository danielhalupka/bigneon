import { observable, computed, action } from "mobx";
import decodeJWT from "../helpers/decodeJWT";
import notifications from "./notifications";
import api from "../helpers/api";

class User {
	@observable id = null;
	@observable token = null;
	@observable name = "";
	@observable email = "";
	@observable phone = "";
	@observable roles = [];

	@action
	refreshUser(onResult = null) {
		const token = localStorage.getItem("access_token");
		if (!token) {
			this.onLogout();
			return;
		}

		api()
			.get("/users/me")
			.then(response => {
				const { data } = response;

				const {
					user: { id, name, email, phone },
					roles
				} = data;
				const jwtData = decodeJWT(token);

				const {
					sub //UserId
				} = jwtData;

				this.token = token;
				this.id = id;
				this.name = name;
				this.email = email;
				this.phone = phone;
				this.roles = roles;

				if (onResult) {
					onResult({ id, name, email, phone });
				}
			})
			.catch(error => {
				console.error(error);
				//TODO if we get a 401, try refresh the token and then try this all again. But don't create a recursive loop.
				//If we get a 401, assume the token expired
				if (error.response && error.response.status === 401) {
					console.log("Unauthorized, logging out.");
					notifications.show({ message: "Session expired", variant: "info" });
					this.onLogout();
				} else {
					notifications.show({ message: error.message, variant: "error" });
				}
			});
	}

	@action
	refreshToken(onSuccess, onError) {
		const refresh_token = localStorage.getItem("access_token");
		if (!refresh_token) {
			onError("Missing refresh token.");
			return;
		}

		api({ auth: false })
			.post("/auth/token/refresh", { refresh_token })
			.then(response => {
				const { access_token, refresh_token } = response.data;
				console.log(response.data);
				onSuccess();
			})
			.catch(error => {
				console.error(error);
				onError(error);
			});
	}

	//After logout
	@action
	onLogout() {
		this.token = false;
		this.id = null;
		this.name = name;
		this.email = "";
		this.phone = "";
		this.roles = [];

		localStorage.removeItem("access_token");

		//If they logged in with facebook, kill that session also
		if (window.FB) {
			window.FB.getLoginStatus(({ status }) => {
				if (status === "connected") {
					window.FB.logout(() => {});
				}
			});
		}
	}

	@computed
	get isAuthenticated() {
		//If the token is set, return 'true'.
		//If it's not set yet been checked it's 'null'.
		//If it has been checked but not authed then it's 'false'
		return this.token ? !!this.token : this.token;
	}

	@computed
	get isAdmin() {
		//console.log(this.roles);
		return this.roles.indexOf("Admin") > -1;
	}

	@computed
	get isOrgOwner() {
		return this.roles.indexOf("OrgOwner") > -1;
	}

	@computed
	get isOrgMember() {
		return this.roles.indexOf("OrgMember") > -1;
	}

	@computed
	get isUser() {
		return this.roles.indexOf("User") > -1;
	}

	@computed
	get isGuest() {
		//If they haven't signed in or they're simply an end user.
		//This might change
		return !this.token || this.roles.indexOf("User") > -1;
	}
}

const user = new User();

export default user;
