import React, { Fragment, PureComponent } from "react";
import PropTypes from "prop-types";
import { DateTimePicker } from "material-ui-pickers";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
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
		error,
		value,
		name,
		label,
		placeholder,
		onChange,
		onBlur,
		onFocus
	} = props;

	const { classes } = props;

	//Get tomorrows date at 12pm as default
	const tomorrow = moment().add(1, "days");
	tomorrow.set({ hour: 12, minute: 0, second: 0 });

	//If there is no date chosen yet and they click it for the first time set it as the current time
	const onFocusOverride = value ? onFocus : () => onChange(tomorrow);

	return (
		<FormControl
			className={classes.formControl}
			error
			aria-describedby={`%${name}-error-text`}
		>
			<DateTimePicker
				id={name}
				error={!!error}
				label={label}
				value={value}
				onChange={onChange}
				animateYearScrolling={false}
				margin="normal"
				onBlur={onBlur}
				onFocus={onFocusOverride}
				placeholder={placeholder || "YYYY/MM/DD HH:mm"}
				minDate={new Date()} //Default minDate is current day
				format="YYYY/MM/DD HH:mm"
				keyboard
			/>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

DateTimePickerGroup.propTypes = {
	error: PropTypes.string,
	value: PropTypes.object,
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func
};

export default withStyles(styles)(DateTimePickerGroup);
