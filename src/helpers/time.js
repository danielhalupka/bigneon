import moment from "moment-timezone";

/**
 * Accepts an object, iterates through elements and if it's an
 * instance of moment then update the timezone
 *
 * @params {group, timezone}
 * @returns {updatedMomentObjects}
 */
export const updateTimezonesInObjects = (group, timezone, maintainLocalTime = false) => {
	if (!timezone) {
		return {};
	}

	const updatedMomentObjects = {};
	Object.keys(group).forEach(key => {
		const value = group[key];
		if (value instanceof moment) {
			const previousDateTimeNumbers = {
				year: value.get("year"),
				month: value.get("month"),
				date: value.get("date"),
				hour: value.get("hour"),
				minute: value.get("minute"),
				second: value.get("second")
			};

			const sameTimeDifferentZone = value.clone().tz(timezone);

			//Only if they're switching venue timezones do we want to maintain the original local time
			if (maintainLocalTime) {
				sameTimeDifferentZone.set(previousDateTimeNumbers);
			}

			updatedMomentObjects[key] = sameTimeDifferentZone;
		}
	});

	return updatedMomentObjects;
};