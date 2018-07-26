import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";

const styles = () => ({
	formControl: {
		width: "100%"
	}
});

const SelectGroup = props => {
	const { value, items, error, name, label, onChange, onBlur, onFocus } = props;
	const { classes } = props;

	return (
		<FormControl
			className={classes.formControl}
			error={!!error}
			aria-describedby={`%${name}-error-text`}
		>
			<InputLabel htmlFor={name}>{label}</InputLabel>
			<Select
				value={value}
				onChange={onChange}
				inputProps={{
					name,
					id: name,
					onBlur,
					onFocus
				}}
			>
				{Object.keys(items).map(key => (
					<MenuItem key={key} value={key}>
						{items[key]}
					</MenuItem>
				))}
			</Select>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

SelectGroup.propTypes = {
	items: PropTypes.object.isRequired,
	error: PropTypes.string,
	value: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func
};

export default withStyles(styles)(SelectGroup);
