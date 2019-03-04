import * as Sentry from "@sentry/browser";

const dsn = process.env.REACT_APP_SENTRY_DSN;

const init = () => {
	if (dsn) {
		Sentry.init({ dsn, release: REACT_APP_VERSION });

		Sentry.configureScope((scope) => {
			scope.setTag("hostname", "bn-web");
		});
	} else {
		console.warn("No sentry tracking DSN.");
	}
};

const configureScope = ({ userId, ...extras }) => {
	if (!dsn) {
		return;
	}

	Sentry.configureScope(scope => {
		userId ? scope.setUser({ id: userId }) : null;

		Object.keys(extras).forEach(key => {
			scope.setExtra(key, extras[key]);
		});
	});
};

const captureCaughtComponentError = (error, errorInfo) => {
	if (!dsn) {
		return;
	}

	Sentry.withScope(scope => {
		Object.keys(errorInfo).forEach(key => {
			scope.setExtra(key, errorInfo[key]);
		});
		Sentry.captureException(error);
	});
};

const captureException = (error, message = null) => {
	if (!dsn) {
		return;
	}

	Sentry.withScope(scope => {
		message ? scope.setExtra("User message", message) : null;
		Sentry.captureException(error);
	});
};

const captureApiErrorResponse = (error, message) => {
	if (!dsn) {
		return;
	}

	Sentry.withScope(scope => {
		let titleMessage = message;
		scope.setExtra("User message", message);

		if (error && error.response) {
			const { status, statusText, data } = error.response;
			scope.setExtra("response.status", status);
			scope.setExtra("response.statusText", statusText);
			scope.setExtra("response.data", data);

			titleMessage = `API response failed with ${status} - ${titleMessage}`;
		}

		Sentry.captureMessage(titleMessage, "error");
	});
};

const captureMessage = (message, level = "error") => {
	if (!dsn) {
		return;
	}

	//'fatal', 'error', 'warning', 'log', 'info, 'debug', 'critical'
	Sentry.captureMessage(message, level);
};

//For future events
const addBreadcrumb = (message) => {
	if (!dsn) {
		return;
	}

	Sentry.addBreadcrumb({
		message
	});
};

export default { init, configureScope, captureCaughtComponentError, captureException, captureApiErrorResponse, captureMessage, addBreadcrumb };
