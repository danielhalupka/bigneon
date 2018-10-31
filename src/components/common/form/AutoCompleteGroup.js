import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Creatable from "react-select/lib/Creatable";

import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

const styles = theme => {
	return {
		formControl: {
			width: "100%",
			marginTop: theme.spacing.unit * 2
		},
		input: {
			display: "flex",
			padding: 0
		},
		valueContainer: {
			display: "flex",
			flexWrap: "wrap",
			flex: 1,
			alignItems: "center"
		},
		noOptionsMessage: {
			padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
		},
		placeholder: {
			position: "absolute",
			left: 2,
			fontSize: theme.overrides.MuiInput.root.fontSize
		}
	};
};

function NoOptionsMessage(props) {
	return (
		<Typography
			color="textSecondary"
			className={props.selectProps.classes.noOptionsMessage}
			{...props.innerProps}
		>
			{props.children}
		</Typography>
	);
}

function inputComponent({ inputRef, ...props }) {
	return <div ref={inputRef} {...props} />;
}

function Control(props) {
	return (
		<TextField
			fullWidth
			InputProps={{
				inputComponent,
				inputProps: {
					className: props.selectProps.classes.input,
					inputRef: props.innerRef,
					children: props.children,
					...props.innerProps
				}
			}}
			{...props.selectProps.textFieldProps}
		/>
	);
}

function Option(props) {
	return (
		<MenuItem
			buttonRef={props.innerRef}
			selected={props.isFocused}
			component="div"
			style={{
				fontWeight: props.isSelected ? 500 : 400
			}}
			{...props.innerProps}
		>
			{props.children}
		</MenuItem>
	);
}

function Placeholder(props) {
	return (
		<Typography
			color="textSecondary"
			className={props.selectProps.classes.placeholder}
			{...props.innerProps}
		>
			{props.children}
		</Typography>
	);
}

function ValueContainer(props) {
	return (
		<div className={props.selectProps.classes.valueContainer}>
			{props.children}
		</div>
	);
}

const components = {
	Option,
	Control,
	NoOptionsMessage,
	Placeholder,
	ValueContainer
};

class AutoCompleteGroup extends React.Component {
	constructor(props) {
		super(props);

		// this.state = {
		// 	value: ""
		// };
	}

	//TODO test and uncomment when needed
	// static getDerivedStateFromProps(props, state) {
	// 	const { value } = props;
	// 	console.log(value);
	// 	if (value) {
	// 		return { value };
	// 	}
	// 	return null;
	// }

	// handleChange = value => {
	// 	this.setState({
	// 		value
	// 	});
	// };

	render() {
		const {
			classes,
			theme,
			value,
			items,
			error,
			name,
			onCreateOption,
			formatCreateLabel,
			label,
			onChange,
			onBlur,
			onFocus,
			style
		} = this.props;

		const selectStyles = {
			input: base => ({
				...base,
				color: theme.palette.text.primary
			})
		};

		const suggestions = Object.keys(items).map(key => ({
			value: key,
			label: items[key]
		}));

		//If they pass through the function to create a new entry then it needs to be a different component
		const SelectComponent = onCreateOption ? Creatable : Select;

		return (
			<FormControl
				className={classes.formControl}
				error={!!error}
				aria-describedby={`%${name}-error-text`}
				style={style}
			>
				<SelectComponent
					classes={classes}
					styles={selectStyles}
					options={suggestions}
					components={components}
					value={value}
					onChange={({ value, label }) => onChange(value, label)}
					onCreateOption={onCreateOption}
					isClearable
					formatCreateLabel={formatCreateLabel}
					placeholder={label}
					onBlur={onBlur}
					onFocus={onFocus}
				/>
				<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
			</FormControl>
		);
	}
}

AutoCompleteGroup.propTypes = {
	items: PropTypes.object.isRequired,
	error: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	onCreateOption: PropTypes.func,
	formatCreateLabel: PropTypes.func,
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	style: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(AutoCompleteGroup);
