import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import {
	withStyles,
	Typography,
	InputAdornment,
	Collapse
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";

const styles = theme => {
	return {
		root: { display: "flex" },
		inputContainer: {
			flex: 1,
			paddingRight: theme.spacing.unit * 4,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center"
		},
		dateInputContainer: {
			marginTop: 8
		},
		deleteIconContainer: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center"
		}
	};
};

const PricePoint = props => {
	const {
		classes,
		name,
		startDate,
		startTime,
		endDate,
		endTime,
		value,
		errors,
		validateFields,
		updatePricePointDetails,
		onDelete
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

			<div
				className={classnames({
					[classes.inputContainer]: true,
					[classes.dateInputContainer]: true
				})}
			>
				<DateTimePickerGroup
					error={errors.startDate}
					value={startDate}
					name="startDate"
					type="date"
					label="On sale date"
					onChange={startDate => updatePricePointDetails({ startDate })}
					onBlur={validateFields}
					minDate={false}
				/>
				<DateTimePickerGroup
					error={errors.startTime}
					value={startTime}
					name="startTime"
					type="time"
					label="On sale time"
					onChange={startTime => updatePricePointDetails({ startTime })}
					onBlur={validateFields}
					minDate={false}
				/>
			</div>

			<div
				className={classnames({
					[classes.inputContainer]: true,
					[classes.dateInputContainer]: true
				})}
			>
				<DateTimePickerGroup
					error={errors.endDate}
					value={endDate}
					name="endDate"
					type="date"
					label="End sale date"
					onChange={endDate => updatePricePointDetails({ endDate })}
					onBlur={validateFields}
					minDate={false}
				/>
				<DateTimePickerGroup
					error={errors.endTime}
					value={endTime}
					name="endTime"
					type="time"
					label="End sale time"
					onChange={endTime => updatePricePointDetails({ endTime })}
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
					label="Price"
					placeholder="50"
					type="number"
					onChange={e => {
						updatePricePointDetails({ value: e.target.value });
					}}
					onBlur={validateFields}
				/>
			</div>

			<div className={classes.deleteIconContainer}>
				<IconButton onClick={onDelete} aria-label="Delete">
					<DeleteIcon />
				</IconButton>
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
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	onDelete: PropTypes.func.isRequired
};

export default withStyles(styles)(PricePoint);
