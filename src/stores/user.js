import { observable, computed, action } from "mobx";

class User {
	@observable id = null;
	@observable token = null;
	@observable name = "";
	@observable email = "";
	@observable phone = "";

	//After login
	@action
	onLogin({ token, id, name, email, phone }) {
		this.token = token;
		this.id = id;
		this.name = name;
		this.email = email;
		this.phone = phone;
	}

	//After logout
	@action
	onLogout() {
		this.token = false;
		this.id = null;
		this.name = name;
		this.email = "";
		this.phone = "";

		localStorage.removeItem("token");
	}

	@computed
	get isAuthenticated() {
		//If the token is set, return 'true'.
		//If it's not set yet been checked it's 'null'.
		//If it has been checked but not authed then it's 'false'
		return this.token ? !!this.token : this.token;
	}
}

const user = new User();

export default user;
