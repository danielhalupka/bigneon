import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";

const styles = () => ({
	formControl: {
		width: "100%"
	}
});

const InputGroup = props => {
	const {
		error,
		value,
		name,
		label,
		type = "text",
		onChange,
		onBlur,
		onFocus
	} = props;

	const { classes } = props;

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
			/>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

InputGroup.propTypes = {
	error: PropTypes.string,
	value: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	type: PropTypes.string,
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func
};

export default withStyles(styles)(InputGroup);
