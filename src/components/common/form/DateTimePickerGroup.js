//TODO issue created to remove this picker and place a simple text based one/
//https://github.com/big-neon/bn-web/issues/316
import React from "react";
import PropTypes from "prop-types";
import { DateTimePicker, TimePicker, DatePicker } from "material-ui-pickers";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import moment from "moment";

const styles = theme => {
	return {
		formControl: {
			width: "100%"
		}
	};
};

const DateTimePickerGroup = props => {
	const {
		type,
		error,
		value,
		name,
		label,
		placeholder,
		onChange,
		onBlur,
		onFocus,
		minDate,
		format,
		margin
	} = props;

	const { classes } = props;

	//Get tomorrows date at 12pm as default
	const tomorrow = moment.utc().add(1, "days");
	tomorrow.set({ hour: 12, minute: 0, second: 0 });

	//If there is no date chosen yet and they click it for the first time set it as the current time
	const onFocusOverride = value ? onFocus : () => onChange(tomorrow);

	//Certain pickers won't accept some proptypes so we skip them
	let additionalProps = {};
	let Picker;
	let formatOverride = format;
	switch (type) {
		case "date-time":
			Picker = DateTimePicker;
			additionalProps = { animateYearScrolling: false };
			break;
		case "time":
			Picker = TextField;
			additionalProps = { type: "time", defaultValue : "19:30", onFocus: null, onBlur: null };
			break;
		case "date":
			formatOverride = "MM/DD/YYYY";
			Picker = DatePicker;
			break;
	}

	if (minDate) {
		additionalProps.minDate = minDate;
	}

	return (
		<FormControl
			className={classes.formControl}
			error
			aria-describedby={`%${name}-error-text`}
		>
			<Picker
				id={name}
				error={!!error}
				label={label}
				value={value ? value : null}
				onChange={onChange}
				margin={margin}
				onBlur={onBlur}
				onFocus={onFocusOverride}
				placeholder={placeholder || formatOverride}
				format={formatOverride}
				keyboard
				{...additionalProps}
				keyboardIcon={null}
			/>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

DateTimePickerGroup.defaultProps = {
	minDate: null,
	type: "date-time",
	format: "MM/DD/YYYY hh:mm",
	margin: "normal"
};

DateTimePickerGroup.propTypes = {
	type: PropTypes.oneOf(["date", "date-time", "time"]),
	error: PropTypes.string,
	value: PropTypes.object,
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	minDate: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
	format: PropTypes.string,
	margin: PropTypes.string
};

export default withStyles(styles)(DateTimePickerGroup);
