import axios from "axios";

export default (options = {}) => {
	console.warn("api.js is deprecated. Use bigneon.js module instead.");
	const { auth } = options;
	let headers = {};

	//If they didn't specify to use the token, assume true
	if (auth || auth === undefined) {
		const accessToken = localStorage.getItem("access_token");
		if (accessToken) {
			headers = {
				Authorization: `Bearer ${accessToken}`
			};
		}
		//TODO if the token is missing find a way to gracefully throw an error globally without adding a try/catch to each api call
	}

	const baseURL = `${process.env.REACT_APP_API_PROTOCOL}://${
		process.env.REACT_APP_API_HOST
	}:${process.env.REACT_APP_API_PORT}${process.env.REACT_APP_API_BASEPATH}/`;

	return axios.create({
		baseURL,
		headers
	});
};
