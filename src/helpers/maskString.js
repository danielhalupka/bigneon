export default (value = "") => {
	if (!value || value.length < 2) {
		return "*";
	}

	const middleLength = value.length > 2 ? value.length - 2 : 2;
	const replaceChars = Array(middleLength + 1).join("*");
	return value.replace(value.substring(1, middleLength + 1), replaceChars);
};