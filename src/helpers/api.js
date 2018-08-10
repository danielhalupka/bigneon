import axios from "axios";

export default (options = {}) => {
	const { auth } = options;
	let headers = {};

	//If they didn't specify to use the token, assume true
	if (auth || auth === undefined) {
		const token = localStorage.getItem("access_token");
		if (token) {
			headers = {
				Authorization: `Bearer ${token}`
			};
		}
		//TODO if the token is missing find a way to gracefully throw an error globally without adding a try/catch to each api call
	}

	const baseURL = `${process.env.REACT_APP_API_PROTOCOL}://${
		process.env.REACT_APP_API_HOST
	}:${process.env.REACT_APP_API_PORT}/`;

	return axios.create({
		baseURL,
		headers
	});
};
