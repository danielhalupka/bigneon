import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import MaskedInput from "react-text-mask";

import FormatInputLabel from "../../elements/form/FormatInputLabel";

const PhoneNumberInputMask = props => {
	const { inputRef, ...other } = props;

	return (
		<MaskedInput
			{...other}
			ref={inputRef}
			mask={[
				"+",
				" ",
				/\d/,
				" ",
				"(",
				/\d/,
				/\d/,
				/\d/,
				")",
				" ",
				/\d/,
				/\d/,
				/\d/,
				"-",
				/\d/,
				/\d/,
				/\d/,
				/\d/
			]}
			placeholderChar={"\u2000"}
			showMask
			guide={false}
		/>
	);
};

PhoneNumberInputMask.propTypes = {
	inputRef: PropTypes.func.isRequired
};

const styles = theme => {
	return {
		formControl: {
			width: "100%"
		},
		search: {
			textAlign: "center",
			fontSize: theme.typography.body1.fontSize
		}
	};
};

const InputGroup = props => {
	const {
		disabled,
		classes,
		error,
		value,
		name,
		label,
		placeholder,
		type,
		isSearch,
		onChange,
		onBlur,
		onFocus,
		multiline,
		autoFocus,
		InputProps = {},
		autoComplete,
		allowNegative,
		labelProps
	} = props;

	let inputPropClasses = {};
	if (isSearch) {
		inputPropClasses = { ...inputPropClasses, input: classes.search };
	}

	if (type === "phone") {
		InputProps.inputComponent = PhoneNumberInputMask;
	}

	let onChangeEvent = onChange;
	//Stop them from entering negative numbers unless they explicitly allow them
	if (type === "number" && !allowNegative) {
		onChangeEvent = e => {
			const numberString = e.target.value;
			if (!isNaN(numberString) && Number(numberString) >= 0) {
				onChange(e);
			}
		};
	}

	return (
		<FormControl
			className={classes.formControl}
			error
			aria-describedby={`%${name}-error-text`}
		>
			<TextField
				error={!!error}
				id={name}
				label={label ? <FormatInputLabel {...labelProps}>{label}</FormatInputLabel> : null}
				type={type}
				value={value}
				onChange={onChangeEvent}
				margin="normal"
				onBlur={onBlur}
				onFocus={onFocus}
				InputProps={{
					...InputProps,
					classes: inputPropClasses
				}}
				InputLabelProps={{
					shrink: true
				}}
				placeholder={placeholder}
				multiline={multiline}
				autoFocus={autoFocus}
				disabled={disabled}
				autoComplete={autoComplete}
				onWheel={e => e.preventDefault()}
			/>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

InputGroup.defaultProps = {
	value: "",
	type: "text",
	labelProps: {}
};

InputGroup.propTypes = {
	error: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	type: PropTypes.string,
	isSearch: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	multiline: PropTypes.bool,
	autoFocus: PropTypes.bool,
	InputProps: PropTypes.object,
	disabled: PropTypes.bool,
	autoComplete: PropTypes.string,
	allowNegative: PropTypes.bool,
	labelProps: PropTypes.object
};

export default withStyles(styles)(InputGroup);
