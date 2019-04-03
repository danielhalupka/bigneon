const dateFormat = "MMM DD, YYYY, z";

export default (startDate, endDate) => {
	return (startDate && endDate) ? `from ${startDate.format(dateFormat)} - ${endDate.format(dateFormat)}` : "from all time";
};
