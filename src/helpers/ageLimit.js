export const displayAgeLimit = (ageLimit) => {
	//The weak typing is on purpose
	if (!ageLimit || ageLimit == 0) {
		return "This event is all ages";
	} else if (isNaN(ageLimit)) {
		return ageLimit;
	} else {
		return `This event is ${ageLimit}+`;
	}
};