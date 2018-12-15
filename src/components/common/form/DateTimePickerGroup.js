import React, { Component } from "react";
import PropTypes from "prop-types";
import { InlineTimePicker } from "material-ui-pickers";
import { InlineDatePicker } from "material-ui-pickers";
import { InlineDateTimePicker } from "material-ui-pickers";
import {
	FormControl,
	withStyles,
	FormHelperText,
	InputAdornment,
	IconButton
} from "@material-ui/core";
import TimeIcon from "@material-ui/icons/Timer";

const formats = {
	time: "hh:mm A",
	date: "MM/DD/YYYY",
	"date-time": "MM/DD/YYYY hh:mm A"
};

const placeHolders = {
	time: "hh:mm am/pm",
	date: "mm/dd/yyyy",
	"date-time": "mm/dd/yyyy hh:mm am/pm"
};

const looseMasks = {
	time: [
		//Hour
		/\d/,
		/\d/,
		":",
		//Minute
		/\d/,
		/\d/,
		" ",
		//AM/PM
		/[A|a|P|p]/,
		/[M|m]/
	],
	date: [
		//Month
		/\d/,
		/\d/,
		"/",
		//Day
		/\d/,
		/\d/,
		"/",
		//Year
		/\d/,
		/\d/,
		/\d/,
		/\d/
	],
	"date-time": [
		//Month
		/\d/,
		/\d/,
		"/",
		//Day
		/\d/,
		/\d/,
		"/",
		//Year
		/\d/,
		/\d/,
		/\d/,
		/\d/,
		" ",
		//Hour
		/\d/,
		/\d/,
		":",
		//Minute
		/\d/,
		/\d/,
		" ",
		//AM/PM
		/[A|a|P|p]/,
		/[M|m]/
	]
};

const styles = theme => {
	return {
		formControl: {
			width: "100%"
		}
	};
};

class DateTimePickerGroup extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {
			type,
			error,
			name,
			label,
			placeholder,
			onChange,
			onFocus,
			onBlur,
			classes,
			value
		} = this.props;

		let Picker;
		let additionalProps = {};
		let inputProps = {};

		switch (type) {
			case "date-time":
				Picker = InlineDateTimePicker;
				additionalProps = { animateYearScrolling: false };

				break;
			case "time":
				Picker = InlineTimePicker;
				inputProps = {
					...inputProps,
					endAdornment: null
					//  (
					// 	<InputAdornment position="end">
					// 		<IconButton>
					// 			<TimeIcon />
					// 		</IconButton>
					// 	</InputAdornment>
					// )
				};
				break;
			case "date":
				Picker = InlineDatePicker;
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
					value={value ? value : null}
					onChange={onChange}
					onBlur={onBlur}
					onFocus={onFocus}
					placeholder={placeholder || placeHolders[type]}
					format={formats[type]}
					keyboard
					InputProps={inputProps}
					mask={looseMasks[type]}
					clearable
					{...additionalProps}
				/>

				<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
			</FormControl>
		);
	}
}

DateTimePickerGroup.defaultProps = {
	type: "date-time"
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
	onFocus: PropTypes.func
};

export default withStyles(styles)(DateTimePickerGroup);
