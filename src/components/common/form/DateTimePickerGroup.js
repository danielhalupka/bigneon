import React from "react";
import PropTypes from "prop-types";
import { DateTimePicker, TimePicker, DatePicker } from "material-ui-pickers";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
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
		format,
		minDate
	} = props;

	const { classes } = props;

	//Get tomorrows date at 12pm as default
	const tomorrow = moment().add(1, "days");
	tomorrow.set({ hour: 12, minute: 0, second: 0 });

	//If there is no date chosen yet and they click it for the first time set it as the current time
	const onFocusOverride = value ? onFocus : () => onChange(tomorrow);

	//Certain pickers won't accept some proptypes so we skip them
	let addtionalProps = {};
	let Picker;
	switch (type) {
		case "date-time":
			Picker = DateTimePicker;
			addtionalProps = { animateYearScrolling: false };
			break;
		case "time":
			Picker = TimePicker;
			break;
		case "date":
			Picker = DatePicker;
			break;
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
				value={value}
				onChange={onChange}
				margin="normal"
				onBlur={onBlur}
				onFocus={onFocusOverride}
				placeholder={placeholder || format}
				minDate={minDate}
				format={format}
				keyboard
				{...addtionalProps}
			/>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

DateTimePickerGroup.defaultProps = {
	type: "date-time",
	format: "YYYY/MM/DD HH:mm",
	minDate: new Date()
};

DateTimePickerGroup.propTypes = {
	type: PropTypes.oneOf(["date-time", "time"]), //TODO add date option if required
	error: PropTypes.string,
	value: PropTypes.object,
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	format: PropTypes.string,
	minDate: PropTypes.object
};

export default withStyles(styles)(DateTimePickerGroup);
