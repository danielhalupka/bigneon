import axios from "axios";
import Bigneon from "./bigneon";

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
		process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}${process.env.REACT_APP_API_BASEPATH}/`;

	const client = axios.create({
		baseURL,
		headers
	});
	const checkUrl = (method, url) => {
		let replacementUrl = Bigneon().matchUrl(method, url, "Bigneon()");
		if (replacementUrl) {
			console.warn("API replacement has been implemented at", replacementUrl);
		}else {
			console.warn("There is no endpoint for", url);
		}
	} ;
	return {
		get() {
			checkUrl("get", arguments[0]);
			return client.get.apply(client, arguments);
		},
		put() {
			checkUrl("put", arguments[0]);
			return client.put.apply(client, arguments);

		},
		post() {
			checkUrl("post", arguments[0]);
			return client.post.apply(client, arguments);

		},
		delete() {
			checkUrl("delete", arguments[0]);
			return client.delete.apply(client, arguments);
		},
		patch() {
			checkUrl("patch", arguments[0]);
			return client.patch.apply(client, arguments);
		},


	};

};
