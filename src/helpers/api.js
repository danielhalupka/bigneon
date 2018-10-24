import axios from "axios";

export default (options = {}) => {
	console.warn("api.js is deprecated. Use bn-api-node instead.");
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
	}

	const baseURL = `${process.env.REACT_APP_API_PROTOCOL}://${
		process.env.REACT_APP_API_HOST
	}:${process.env.REACT_APP_API_PORT}/`;

	return axios.create({
		baseURL,
		headers
	});
};
