import { observable, computed, action } from "mobx";
import translateApiErrors from "../helpers/translateApiErrors";
import errorReporting from "../helpers/errorReporting";

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
		const { message } = formattedError;
		this.message = message;
		this.variant = variant;

		errorReporting.captureApiErrorResponse(error, message);

		return formattedError;
	}

	@action
	show({ message, variant = "info" }) {
		this.message = message;
		this.variant = variant;

		if (variant === "error") {
			errorReporting.captureMessage(message);
		}
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
