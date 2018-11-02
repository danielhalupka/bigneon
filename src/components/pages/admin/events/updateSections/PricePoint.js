import React from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Typography,
	InputAdornment,
	Collapse
} from "@material-ui/core";
import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import IconButton from "../../../../elements/IconButton";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";

const styles = theme => {
	return {
		root: { display: "flex" },
		inputContainer: { flex: 1, paddingRight: theme.spacing.unit * 4 }
	};
};

const PricePoint = props => {
	const {
		classes,
		name,
		startDate,
		endDate,
		value,
		errors,
		validateFields,
		updatePricePointDetails
	} = props;

	return (
		<div className={classes.root}>
			<div className={classes.inputContainer}>
				<InputGroup
					error={errors.name}
					value={name}
					name="name"
					label="Price name"
					placeholder="Early Bird / General Admission / Day Of"
					type="text"
					onChange={e => {
						updatePricePointDetails({ name: e.target.value });
					}}
					onBlur={validateFields}
				/>
			</div>

			<div className={classes.inputContainer}>
				<DateTimePickerGroup
					error={errors.startDate}
					value={startDate}
					name="startDate"
					label="On sale Time"
					onChange={startDate => updatePricePointDetails({ startDate })}
					onBlur={validateFields}
					minDate={false}
				/>
			</div>

			<div className={classes.inputContainer}>
				<DateTimePickerGroup
					error={errors.endDate}
					value={endDate}
					name="endDate"
					label="End sale Time"
					onChange={endDate => updatePricePointDetails({ endDate })}
					onBlur={validateFields}
					minDate={false}
				/>
			</div>

			<div className={classes.inputContainer}>
				<InputGroup
					InputProps={{
						startAdornment: <InputAdornment position="start">$</InputAdornment>
					}}
					error={errors.value}
					value={value}
					name="value"
					label="Amount"
					placeholder="50"
					type="number"
					onChange={e => {
						updatePricePointDetails({ value: e.target.value });
					}}
					onBlur={validateFields}
				/>
			</div>
		</div>
	);
};

PricePoint.propTypes = {
	classes: PropTypes.object.isRequired,
	errors: PropTypes.object,
	updatePricePointDetails: PropTypes.func.isRequired,
	validateFields: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	startDate: PropTypes.object.isRequired,
	endDate: PropTypes.object.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default withStyles(styles)(PricePoint);
