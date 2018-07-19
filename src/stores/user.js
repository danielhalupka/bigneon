import { observable, computed, action } from "mobx";

class User {
	@observable userId = null;

	@action
	setId(userId) {
		this.userId = userId;
	}

	@computed
	get isAuthenticated() {
		return !!this.userId;
	}
}

const user = new User();

export default user;
