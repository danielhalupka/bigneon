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
	IconButton,
	Typography,
	TextField,
	Menu,
	MenuItem,
	Button,
	Popper,
	Paper,
	MenuList,
	Popover,
	Grow,
	ClickAwayListener
} from "@material-ui/core";
import TimeIcon from "@material-ui/icons/AccessTime";
import SelectGroup from "./SelectGroup";
import AutoCompleteGroup from "./AutoCompleteGroup";
import moment from "moment";

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
	]
};

const styles = theme => {
	return {
		formControl: {
			width: "100%"
		},
		popover: {
			maxHeight: "300px"
		}
	};
};

let timeFormat = "h:mm A";
class DateTimePickerGroup extends Component {
	constructor(props) {
		super(props);
		let { value } = this.props;

		this.state = {
			anchorEl: null,
			timeFormatted: !value
				? null
				: value.isValid()
					? value.format(timeFormat)
					: value.creationData().input,
			isTimeValid: !value || value.isValid()
		};
	}

	componentDidUpdate() {
		let { value } = this.props;
		let { isTimeValid, timeFormatted, dateFormatted } = this.state;
		let newIsTimeValid = !value || value.isValid();
		let newTimeFormatted = !value
			? null
			: value.isValid()
				? value.format(timeFormat)
				: value.creationData().input;

		if (isTimeValid !== newIsTimeValid || timeFormatted !== newTimeFormatted) {
			this.setState({
				isTimeValid: newIsTimeValid,
				timeFormatted: newTimeFormatted
			});
		}
	}

	openPicker = e => {
		// do not pass Event for default pickers
		this.picker.open(e);
	};

	onClick = event => {
		const { isTimeValid } = this.state;
		if (isTimeValid) {
			this.setState({ anchorEl: event.currentTarget });
		}
	};

	onDateChange = value => {
		const { onChange, type } = this.props;
		onChange(value);
	};

	onTimeChanged = event => {
		let newValue = event.target.value;
		this.setState({ timeFormatted: newValue, anchorEl: null });
		let { onChange } = this.props;

		onChange(moment(newValue, timeFormat, true));
	};

	onTimeSelected = (event, value) => {
		let { onChange } = this.props;
		onChange(moment(value, timeFormat, true));
		this.setState({ anchorEl: null });
	};

	onTimePickerClose = () => {
		this.setState({ anchorEl: null });
	};

	render() {
		const {
			type,
			error,
			name,
			label,
			placeholder,
			onFocus,
			onBlur,
			classes,
			value
		} = this.props;

		let additionalProps = {};
		let inputProps = {};

		let times = [
			"12:00 AM",
			"12:30 AM",
			"01:00 AM",
			"01:30 AM",
			"02:00 AM",
			"02:30 AM",
			"03:00 AM",
			"03:30 AM",
			"04:00 AM",
			"04:30 AM",
			"05:00 AM",
			"05:30 AM",
			"06:00 AM",
			"06:30 AM",
			"07:00 AM",
			"07:30 AM",
			"08:00 AM",
			"08:30 AM",
			"09:00 AM",
			"09:30 AM",
			"10:00 AM",
			"10:30 AM",
			"11:00 AM",
			"11:30 AM",
			"12:00 PM",
			"12:30 PM",
			"01:00 PM",
			"01:30 PM",
			"02:00 PM",
			"02:30 PM",
			"03:00 PM",
			"03:30 PM",
			"04:00 PM",
			"04:30 PM",
			"05:00 PM",
			"05:30 PM",
			"06:00 PM",
			"06:30 PM",
			"07:00 PM",
			"07:30 PM",
			"08:00 PM",
			"08:30 PM",
			"09:00 PM",
			"09:30 PM",
			"10:00 PM",
			"10:30 PM",
			"11:00 PM",
			"11:30 PM"
		];

		let { anchorEl, timeFormatted, isTimeValid } = this.state;

		return (
			<FormControl
				className={classes.formControl}
				error
				aria-describedby={`%${name}-error-text`}
			>
				{type === "date" ? (
					<div>
						<InlineDatePicker
							style={{ width: "100%" }}
							id={name}
							error={!!error}
							label={label}
							value={value}
							onChange={v => this.onDateChange(v)}
							onBlur={onBlur}
							onFocus={onFocus}
							placeholder={placeholder || placeHolders[type]}
							format="MM/DD/YYYY"
							keyboard
							InputProps={inputProps}
							clearable
							{...additionalProps}
							ref={node => {
								this.picker = node;
							}}
						/>
					</div>
				) : (
					<div />
				)}

				{type === "time" ? (
					<div>
						<TextField
							style={{ width: "100%" }}
							id={name}
							name={name}
							label={label}
							error={!isTimeValid || !!error}
							onClick={event => this.onClick(event)}
							value={timeFormatted}
							onChange={this.onTimeChanged}
						/>
						<Popover
							open={Boolean(anchorEl)}
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left"
							}}
							transformOrigin={{
								vertical: "top",
								horizontal: "left"
							}}
							disableAutoFocus={true}
						>
							<ClickAwayListener onClickAway={this.onTimePickerClose}>
								<Paper elevation={24} className={classes.popover}>
									<MenuList id="time-menu">
										{times.map((time, index) => (
											<MenuItem
												key={time}
												onClick={event => this.onTimeSelected(event, time)}
											>
												{time}
											</MenuItem>
										))}
									</MenuList>
								</Paper>
							</ClickAwayListener>
						</Popover>
					</div>
				) : (
					<div />
				)}
				<FormHelperText id={`${name}-error-text`}>
					{!isTimeValid ? "Not a valid time (e.g. 9:30 PM)" : error}
				</FormHelperText>
			</FormControl>
		);
	}
}

DateTimePickerGroup.propTypes = {
	type: PropTypes.oneOf(["date", "time"]),
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
