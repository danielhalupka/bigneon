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

	//Alternative solution
	// let value = false;
	// try {
	// 	const url = new URL(window.location.href);
	// 	const searchParam = url.searchParams.get(key);
	// 	value = searchParam ? searchParam : false;
	// } catch(err) {
	// 	console.error(err);
	// 	//Attempt 2
	// 	const params = new URLSearchParams(window.location.search);
	//
	// 	const searchParam = params.get(key);
	// 	value = searchParam ? searchParam : false;
	// }
	//
	// return value;
};
