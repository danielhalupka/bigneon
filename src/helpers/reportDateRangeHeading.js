export default (startDate, endDate) => {
	return (startDate && endDate) ? `from ${startDate.format("MMM DD, YYYY")} - ${endDate.format("MMM DD, YYYY")}` : "from all time";
};
