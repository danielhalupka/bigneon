export default (key, value) => {
	const url = window.location.href;

	let theAnchor = null;
	let newAdditionalURL = "";
	let tempArray = url.split("?");
	let baseURL = tempArray[0];
	let additionalURL = tempArray[1];
	let temp = "";

	let tmpAnchor;
	let theParams;

	if (additionalURL) {
		tmpAnchor = additionalURL.split("#");
		theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];
		if (theAnchor) additionalURL = theParams;

		tempArray = additionalURL.split("&");

		for (let i = 0; i < tempArray.length; i++) {
			if (tempArray[i].split("=")[0] != key) {
				newAdditionalURL += temp + tempArray[i];
				temp = "&";
			}
		}
	} else {
		tmpAnchor = baseURL.split("#");
		theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];

		if (theParams) baseURL = theParams;
	}

	if (theAnchor) value += "#" + theAnchor;

	const rows_txt = temp + "" + key + "=" + value;
	const newUrl = baseURL + "?" + newAdditionalURL + rows_txt;

	window.history.replaceState("", "", newUrl);
};
