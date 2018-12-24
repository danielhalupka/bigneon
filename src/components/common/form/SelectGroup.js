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
	},
	formControlNoMargin: {
		width: "100%"
	}
});

const ITEM_PADDING_TOP = 8;

const SelectGroup = props => {
	const {
		value,
		items,
		dropdownHeight = 60,
		dropdownWidth = 250,
		error,
		name,
		label,
		onChange,
		onBlur,
		onFocus,
		missingItemsLabel,
		disableUnderline,
		selectStyle,
		styleClassName = "formControl"
	} = props;
	const { classes } = props;

	let content = <MenuItem disabled>{missingItemsLabel || "No items"}</MenuItem>;
	if (items.length > 0) {
		content = items.map(item => (
			<MenuItem key={item.value} value={item.value}>
				{item.label || item.value}
			</MenuItem>
		));
	}

	return (
		<FormControl
			className={classes[styleClassName]}
			error={!!error}
			aria-describedby={`%${name}-error-text`}
		>
			{label ? <InputLabel htmlFor={name}>{label}</InputLabel> : null}
			<Select
				style={selectStyle}
				disableUnderline={disableUnderline}
				value={value}
				onChange={onChange} //TODO return just e.target.value and go back and change everywhere it's used to make it simpler
				inputProps={{
					name,
					id: name,
					onBlur,
					onFocus
				}}
				MenuProps={{
					PaperProps: {
						style: {
							maxHeight: dropdownHeight * 4.5 + ITEM_PADDING_TOP,
							width: dropdownWidth
						}
					}
				}}
			>
				{content}
			</Select>

			<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
		</FormControl>
	);
};

SelectGroup.propTypes = {
	items: PropTypes.array.isRequired,
	error: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	dropdownWidth: PropTypes.number,
	dropdownHeight: PropTypes.number,
	missingItemsLabel: PropTypes.string, //If there are no items, the text you want to display
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	disableUnderline: PropTypes.bool,
	selectStyle: PropTypes.object,
	styleClassName: PropTypes.string
};

export default withStyles(styles)(SelectGroup);
