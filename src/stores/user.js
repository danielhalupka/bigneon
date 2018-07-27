import { observable, computed, action } from "mobx";
import axios from "axios";
import decodeJWT from "../helpers/decodeJWT";
import notifications from "./notifications";

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

		axios
			.get("http://0.0.0.0:9000/users/me", {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(response => {
				const { data } = response;
				const { id, name, email, phone } = data;
				const jwtData = decodeJWT(token);
				const {
					roles,
					sub //UserId
				} = jwtData;

				const roleArray = roles.split(",");

				this.token = token;
				this.id = id;
				this.name = name;
				this.email = email;
				this.phone = phone;
				this.roles = roleArray;

				if (onResult) {
					onResult({ id, name, email, phone });
				}
			})
			.catch(error => {
				//If there's no repsonse status, assume the pre flight failed because the token is invalid
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
		return !!this.token;
	}
}

const user = new User();

export default user;