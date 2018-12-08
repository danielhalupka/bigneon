export default formatted => {
	return formatted.replace(/[-.*+?^${}()|[\]\\]/g, "").replace(" ", "");
};
