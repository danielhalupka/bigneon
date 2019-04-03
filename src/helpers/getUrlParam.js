export default (key) => {
	const url = window.location.href;

	/*eslint no-useless-escape: 0*/
	const keyName = key.replace(/[\[\]]/g, "\\$&");

	const regex = new RegExp("[?&]" + keyName + "(=([^&#]*)|&|#|$)");
	const results = regex.exec(url);

	if (!results) {
		return null;
	}

	if (!results[2]) {
		return "";
	}

	return decodeURIComponent(results[2].replace(/\+/g, " "));
};
