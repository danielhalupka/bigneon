import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";

const styles = theme => ({
	formControl: {
		width: "100%",
		marginTop: theme.spacing.unit * 2
	}
});

const SelectGroup = props => {
	const {
		value,
		items,
		error,
		name,
		label,
		onChange,
		onBlur,
		onFocus,
		missingItemsLabel
	} = props;
	const { classes } = props;

	const keys = Object.keys(items);

	let content = <MenuItem disabled>{missingItemsLabel || "No items"}</MenuItem>;
	if (keys.length > 0) {
		content = keys.map(key => (
			<MenuItem key={key} value={key}>
				{items[key]}
			</MenuItem>
		));
	}

	return (
		<FormControl
			className={classes.formControl}
			error={!!error}
			aria-describedby={`%${name}-error-text`}
		>
			{label ? <InputLabel htmlFor={name}>{label}</InputLabel> : null}
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
				{content}
			</Select>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

SelectGroup.propTypes = {
	items: PropTypes.object.isRequired,
	error: PropTypes.string,
	value: PropTypes.string.isRequired,
	missingItemsLabel: PropTypes.string, //If there are no items, the text you want to display
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func
};

export default withStyles(styles)(SelectGroup);
