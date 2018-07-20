import { observable, computed, action } from "mobx";

class Notification {
	@observable message = "";
	@observable variant = "";

	@action
	show({ message, variant = "info" }) {
		this.message = message;
		this.variant = variant;
	}

	@action
	hide() {
		this.message = "";
	}

	@computed
	get isOpen() {
		return !!this.message;
	}
}

const notification = new Notification();

export default notification;
