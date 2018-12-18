export default formatted => {
	return formatted
		.replace(/[-.*+?^${}()|[\]\\]/g, "")
		.split(" ")
		.join("");
};
