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
		},
		highlight: {
			backgroundColor: "#b2b2b2"
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
				? ""
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
			? ""
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
			value,
			timeIncrement = 30
		} = this.props;

		let additionalProps = {};
		let inputProps = {};

		let start = moment().set({ hour: 0, minute: 0, second: 0 });
		let end = moment(start).add(24, "hours");
		let times = [];
		while (start < end) {
			times.push(start.format("hh:mm A"));
			start.add(timeIncrement, "minutes");
		}

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
												className={
													time === timeFormatted ? classes.highlight : null
												}
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
	onFocus: PropTypes.func,
	timeIncrement: PropTypes.number
};

export default withStyles(styles)(DateTimePickerGroup);
