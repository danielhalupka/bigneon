import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles, InputAdornment, Hidden } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import Button from "../../../../elements/Button";

const styles = theme => {
	return {
		root: {},
		inputContainer: {
			paddingRight: theme.spacing.unit,
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
		onDelete,
		isCancelled
	} = props;

	return (
		<Grid container spacing={8}>
			<Grid
				className={classes.inputContainer}
				item
				xs={12}
				sm={12}
				md={2}
				lg={2}
			>
				<InputGroup
					disabled={isCancelled}
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
			</Grid>

			<Grid
				className={classnames({
					[classes.inputContainer]: true,
					[classes.dateInputContainer]: true
				})}
				item
				xs={6}
				sm={6}
				md={2}
				lg={2}
			>
				<DateTimePickerGroup
					disabled={isCancelled}
					error={errors.startDate}
					value={startDate}
					name="startDate"
					type="date"
					label="On sale date"
					onChange={startDate => updatePricePointDetails({ startDate })}
					onBlur={validateFields}
					minDate={false}
				/>
			</Grid>

			<Grid
				className={classnames({
					[classes.inputContainer]: true,
					[classes.dateInputContainer]: true
				})}
				  item
				xs={6}
				sm={6}
				md={2}
				lg={2}
			>
				<DateTimePickerGroup
					disabled={isCancelled}
					error={errors.startTime}
					value={startTime}
					name="startTime"
					type="time"
					label="On sale time"
					onChange={startTime => updatePricePointDetails({ startTime })}
					onBlur={validateFields}
					minDate={false}
				/>
			</Grid>

			<Grid
				className={classnames({
					[classes.inputContainer]: true,
					[classes.dateInputContainer]: true
				})}
				item
				xs={6}
				sm={6}
				md={2}
				lg={2}
			>
				<DateTimePickerGroup
					disabled={isCancelled}
					error={errors.endDate}
					value={endDate}
					name="endDate"
					type="date"
					label="End sale date"
					onChange={endDate => updatePricePointDetails({ endDate })}
					onBlur={validateFields}
					minDate={false}
				/>
			</Grid>

			<Grid
				className={classnames({
					[classes.inputContainer]: true,
					[classes.dateInputContainer]: true
				})}
				item
				xs={6}
				sm={6}
				md={2}
				lg={2}
			>
				<DateTimePickerGroup
					disabled={isCancelled}
					error={errors.endTime}
					value={endTime}
					name="endTime"
					type="time"
					label="End sale time"
					onChange={endTime => updatePricePointDetails({ endTime })}
					onBlur={validateFields}
					minDate={false}
				/>
			</Grid>

			<Grid
				className={classes.inputContainer}
				item
				xs={12}
				sm={12}
				md={1}
				lg={1}
			>
				<InputGroup
					disabled={isCancelled}
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
			</Grid>

			{!isCancelled ? (
				<Grid
					className={classes.inputContainer}
					item
					xs={12}
					sm={12}
					md={1}
					lg={1}
				>
					<Hidden mdUp>
						<Button
							onClick={onDelete}
							style={{ marginBottom: 20 }}
						>
							Delete price schedule
						</Button>
					</Hidden>

					<Hidden smDown>
						<IconButton onClick={onDelete} aria-label="Delete">
							<DeleteIcon/>
						</IconButton>
					</Hidden>
				</Grid>
			) : null}
		</Grid>
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
	onDelete: PropTypes.func.isRequired,
	isCancelled: PropTypes.bool
};

export default withStyles(styles)(PricePoint);
