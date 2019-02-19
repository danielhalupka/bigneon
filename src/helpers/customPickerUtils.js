/**
 * material-ui-pickers does not display timezones.
 * When passing through a moment-timezone object, it's displayed in UTC format by default.
 * This class extends the MomentUtils and overrides the format(date, format) function.
 * To maintain the timezone date format, the timezone is passed through in place of the format field and the format is just hardcoded here.
 */
import MomentUtils from "@date-io/moment";
import moment from "moment-timezone";

class CustomPickerUtils extends MomentUtils {
	format(value, timezone) {
		return moment(value).tz(timezone)
			.format("MM/DD/YYYY");
	}
}

export default CustomPickerUtils;