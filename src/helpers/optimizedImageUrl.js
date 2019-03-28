/**
 * optimizedImageUrl
 * @params {url, quality}
 *
 * See https://cloudinary.com/documentation/image_optimization
 * quality can be 'best', 'good', 'eco' or 'low'
 */
export default (url, quality = "low") => {
	if (!url || typeof url !== "string") {
		return url;
	}
	
	//Only manipulate urls served from cloudinary
	if (url.indexOf("res.cloudinary.com") === -1) {
		return url;
	}

	const insertAfterString = "/image/upload/";
	const index = url.indexOf(insertAfterString);
	if (index === -1) {
		return url;
	}

	const qualityParams = `f_auto/q_auto:${quality}/`;
	const indexToInsert = index + insertAfterString.length;

	return [url.slice(0, indexToInsert), qualityParams, url.slice(indexToInsert)].join("");
};
