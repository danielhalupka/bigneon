import { observable, computed, action } from "mobx";
import translateApiErrors from "../helpers/translateApiErrors";

class Notification {
	@observable
	message = "";

	@observable
	variant = "";

	@action
	showFromErrorResponse({
		error,
		defaultMessage = "An error occurred.",
		variant = "error"
	}) {
		const formattedError = translateApiErrors(error, defaultMessage);
		this.message = formattedError.message;
		this.variant = variant;
		return formattedError;
	}

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
