import Bigneon from "bn-api-node/dist/bundle.client";
import errorReporting from "./errorReporting";

let bigneon;

export const bigneonFactory = (options = {}, headers = {}, mockData, forceReInit) => {
	if (!bigneon || forceReInit) {
		options = {
			...{
				protocol: process.env.REACT_APP_API_PROTOCOL,
				host: process.env.REACT_APP_API_HOST,
				port: process.env.REACT_APP_API_PORT,
				timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
				basePath: process.env.REACT_APP_API_BASEPATH || "",
				prefix: process.env.REACT_APP_API_PREFIX || ""
			},
			...options
		};

		bigneon = new Bigneon.Server(options, headers, mockData);

		errorReporting.addBreadcrumb("Bigneon client instantiated.");
	}

	const access_token = localStorage.getItem("access_token");
	const refresh_token = localStorage.getItem("refresh_token") || null;
	if (access_token) {
		bigneon.client.setTokens({ access_token, refresh_token });
	}

	return bigneon;
};

export default bigneonFactory;
