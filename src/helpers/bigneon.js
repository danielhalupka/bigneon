import Bigneon from "bn-api-node";

let bigneon;

export const bigneonFactory = (options = {}, headers = {}, mockData) => {
	if (!bigneon) {
		options = {
			...{
				protocol: process.env.REACT_APP_API_PROTOCOL,
				host: process.env.REACT_APP_API_HOST,
				port: process.env.REACT_APP_API_PORT,
				timeout: process.env.REACT_APP_API_TIMEOUT || 3000
			},
			...options
		};
		bigneon = new Bigneon.Server(options, headers, mockData);
	}
	const accessToken = localStorage.getItem("access_token");
	if (accessToken) {
		bigneon.client.setToken(accessToken);
	}
	return bigneon;
};

export default bigneonFactory;
