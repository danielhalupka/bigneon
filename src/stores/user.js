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
		const token = localStorage.getItem("token");
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
				//If there's no repsonse status, assume the pre flight failed because the token is invalid.
				//Idealy the api should still return a status in the response when this happens
				if (!error.response || error.response.status == undefined) {
					console.log("Unauthorized, logging out.");
					notifications.show({ message: "Session expired", variant: "info" });
				} else {
					console.log("refreshUser");
					console.error(error);
					notifications.show({ message: error.message, variant: "error" });
				}
				this.onLogout();
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

		localStorage.removeItem("token");
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
