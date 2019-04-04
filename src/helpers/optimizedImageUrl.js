/**
 * optimizedImageUrl
 * @params {url, quality}
 *
 * See https://cloudinary.com/documentation/image_optimization
 * quality can be 'best', 'good', 'eco' or 'low'
 */
export default (url, quality = "low", size = "f_auto") => {
	if (!url || typeof url !== "string") {
		return url;
	}

	//Only manipulate urls served from cloudinary and ones that have not already been manipulated
	if (url.indexOf("res.cloudinary.com") === -1 || url.indexOf("/q_auto:") > -1) {
		return url;
	}

	if (typeof size === "object") {
		const { w = null, h = null } = size;
		const sizes = [];
		if (w) {
			sizes.push(`w_${w}`);
		}
		if (h) {
			sizes.push(`h_${h}`);
		}
		size = sizes.join(",");
	}

	const insertAfterString = "/image/upload/";
	const index = url.indexOf(insertAfterString);
	if (index === -1) {
		return url;
	}

	const qualityParams = `${size}/q_auto:${quality}/`;
	const indexToInsert = index + insertAfterString.length;

	return [url.slice(0, indexToInsert), qualityParams, url.slice(indexToInsert)].join("");
};
