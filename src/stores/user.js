import { observable, computed, action } from "mobx";

class User {
	@observable id = null;
	@observable name = "";
	@observable email = "";
	@observable phone = "";

	@action
	setDetails({ id, name, email, phone }) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.phone = phone;
	}

	@action
	logout() {
		this.id = null;
	}

	@computed
	get isAuthenticated() {
		return !!this.id;
	}
}

const user = new User();

export default user;
