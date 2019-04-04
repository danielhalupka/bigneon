export default (text, limit = 10) => {
	//Don't append ellipsis if it's just an extra 3 chars
	if (text.length < limit + 3) {
		return text;
	}

	return `${text.substr(0, limit)}...`;
};