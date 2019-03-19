export const displayAgeLimit = (ageLimit) => {
	if (!ageLimit) {
		return "This event is all ages";
	} else if (isNaN(ageLimit)) {
		return ageLimit;
	} else {
		return `This event is ${ageLimit}+`;
	}
};