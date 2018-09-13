import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";

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
		classes,
		error,
		value,
		name,
		label,
		placeholder,
		type = "text",
		isSearch,
		onChange,
		onBlur,
		onFocus,
		multiline,
		autoFocus,
		InputProps = {}
	} = props;

	let inputPropClasses = {};
	if (isSearch) {
		inputPropClasses = { ...inputPropClasses, input: classes.search };
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
				label={label}
				type={type}
				value={value}
				onChange={onChange}
				margin="normal"
				onBlur={onBlur}
				onFocus={onFocus}
				InputProps={{
					...InputProps,
					classes: inputPropClasses
				}}
				placeholder={placeholder}
				multiline={multiline}
				autoFocus={autoFocus}
			/>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

InputGroup.propTypes = {
	error: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
	InputProps: PropTypes.object
};

export default withStyles(styles)(InputGroup);
