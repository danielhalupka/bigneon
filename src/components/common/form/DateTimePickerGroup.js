import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import MaskedInput from "react-text-mask";
import InputGroup from "./InputGroup";

const formats = {
	time: "HH:mm",
	date: "MM/DD/YYYY",
	"date-time": "MM/DD/YYYY HH:mm"
};

//Force times to be certain numbers but loose with dates
const timeStrictMasks = {
	time: [
		//Hour
		/[0-2]/,
		/[0-9]/,
		":",
		//Minute
		/[0-5]/,
		/[0-9]/
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
		/[0-2]/,
		/[0-9]/,
		":",
		//Minute
		/[0-5]/,
		/[0-9]/
	]
};

//Strict number masks
const strictMasks = {
	time: [
		//Hour
		/[0-2]/,
		/[0-9]/,
		":",
		//Minute
		/[0-5]/,
		/[0-9]/
	],
	date: [
		//Month
		/[0-1]/,
		/[0-9]/,
		"/",
		//Day
		/[0-3]/,
		/[0-9]/,
		"/",
		//Year
		/[0-2]/,
		/[0-9]/,
		/[0-9]/,
		/[0-9]/
	],
	"date-time": [
		//Month
		/[0-1]/,
		/[0-9]/,
		"/",
		//Day
		/[0-3]/,
		/[0-9]/,
		"/",
		//Year
		/[0-2]/,
		/[0-9]/,
		/[0-9]/,
		/[0-9]/,

		" ",

		//Hour
		/[0-2]/,
		/[0-9]/,
		":",
		//Minute
		/[0-5]/,
		/[0-9]/
	]
};

const looseMasks = {
	time: [
		//Hour
		/\d/,
		/\d/,
		":",
		//Minute
		/\d/,
		/\d/
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
		/\d/
	]
};

const defaultMaskProps = {
	//placeholderChar={"\u2000"}
	showMask: true,
	guide: false,
	keepCharPositions: true
};

const DateInputMask = props => {
	const { inputRef, ...other } = props;

	return (
		<MaskedInput
			{...other}
			ref={inputRef}
			mask={timeStrictMasks.date}
			{...defaultMaskProps}
		/>
	);
};

const DateTimeInputMask = props => {
	const { inputRef, ...other } = props;

	return (
		<MaskedInput
			{...other}
			ref={inputRef}
			mask={timeStrictMasks["date-time"]}
			{...defaultMaskProps}
		/>
	);
};

const TimeInputMask = props => {
	const { inputRef, ...other } = props;

	return (
		<MaskedInput
			{...other}
			ref={inputRef}
			mask={timeStrictMasks.time}
			{...defaultMaskProps}
		/>
	);
};

class DateTimePickerGroup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value: "",
			inFocus: false
		};

		this.onChange = this.onChange.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	componentDidUpdate(prevProps) {
		const { value, type } = this.props;

		if (value && moment(value).isValid()) {
			const stringValue = moment(value).format(formats[type]);

			if (this.state.value !== stringValue) {
				this.setState({ value: stringValue });
			}
		}
	}

	onChange(e) {
		this.setState({ value: e.target.value });

		const { onChange, type } = this.props;

		const date = moment.utc(e.target.value, formats[type]);

		if (date.isValid()) {
			onChange(date);
		} else {
			//onChange(null);
		}
	}

	onFocus() {
		this.setState({ inFocus: true });
		const { onFocus } = this.props;
		onFocus ? onFocus() : null;
	}

	onBlur() {
		this.setState({ inFocus: false });
		const { onBlur } = this.props;
		onBlur ? onBlur() : null;
	}

	render() {
		const { type, error, name, label, placeholder } = this.props;

		const { value } = this.state;

		let maskComponent;

		switch (type) {
			case "date-time":
				maskComponent = DateTimeInputMask;
				break;
			case "time":
				maskComponent = TimeInputMask;
				break;
			case "date":
				maskComponent = DateInputMask;
				break;
		}

		return (
			<InputGroup
				id={name}
				name={name}
				error={error}
				label={label}
				value={value}
				onChange={this.onChange}
				onFocus={this.onFocus}
				onBlur={this.onBlur}
				placeholder={placeholder || formats[type]}
				InputProps={{ inputComponent: maskComponent }}
			/>
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

export default DateTimePickerGroup;
