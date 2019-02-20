/**
 * material-ui-pickers does not display timezones.
 * When passing through a moment-timezone object, it's displayed in UTC format by default.
 * This class extends the MomentUtils and overrides the format(date, format) function.
 * To maintain the timezone date format, the timezone is passed through in place of the format field and the format is just hardcoded here.
 */
import MomentUtils from "@date-io/moment";
import moment from "moment-timezone";

const dateFormat = "MM/DD/YYYY";

class CustomPickerUtils extends MomentUtils {
	parse(text, formatButActuallyTimezone) {
		return moment(text, dateFormat);
	}

	//Don't change this, it's required to display the date formatted with the correct timezone
	format(value, formatButActuallyTimezone) {
		return moment(value).tz(formatButActuallyTimezone).format(dateFormat);
	}
}

export default CustomPickerUtils;