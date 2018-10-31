import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography, InputAdornment } from "@material-ui/core";
import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import IconButton from "../../../../elements/IconButton";

const styles = theme => {
	return {
		root: {
			paddingLeft: theme.spacing.unit * 12,
			paddingRight: theme.spacing.unit * 2
		},
		ticketHeader: {
			display: "flex",
			justifyContent: "space-between"
		},
		inactiveContent: {
			paddingTop: theme.spacing.unit * 2,
			paddingBottom: theme.spacing.unit * 2
		},
		activeContent: {
			paddingTop: theme.spacing.unit * 3,
			paddingBottom: theme.spacing.unit * 3
		},
		name: {
			textTransform: "uppercase",
			fontFamily: "TTCommons-DemiBold"
		},
		simpleInputs: {
			display: "flex"
		},
		simpleInputContainer: {
			flex: 1,
			marginRight: theme.spacing.unit * 4
		}
	};
};

const TicketHeading = ({
	classes,
	index,
	name,
	onEditClick,
	deleteTicketType,
	active
}) => (
	<div className={classes.ticketHeader}>
		<Typography className={classes.name} variant="subheading">
			{name ? `${index + 1}. ${name}` : "Add your new ticket"}
		</Typography>
		<div>
			<IconButton
				onClick={onEditClick}
				iconUrl={`/icons/edit-${active ? "active" : "gray"}.svg`}
			>
				Edit
			</IconButton>
			<IconButton onClick={deleteTicketType} iconUrl="/icons/delete-gray.svg">
				Delete
			</IconButton>
		</div>
	</div>
);

const InactiveContent = props => {
	const { classes, onEditClick, deleteTicketType } = props;
	return (
		<div className={classes.inactiveContent}>
			<TicketHeading {...props} />
		</div>
	);
};

const TicketDetails = props => {
	const {
		index,
		classes,
		errors,
		validateFields,
		updateTicketType,
		name,
		capacity,
		pricing
	} = props;

	const defaultPrice =
		pricing && pricing[0] && pricing[0].value ? pricing[0].value : "";

	return (
		<div className={classes.activeContent}>
			<TicketHeading {...props} />

			<div className={classes.simpleInputs}>
				<div className={classes.simpleInputContainer} style={{ flex: 2 }}>
					<InputGroup
						error={errors.name}
						value={name}
						name="name"
						label="Ticket name"
						placeholder="General Admission"
						type="text"
						onChange={e => {
							updateTicketType(index, { name: e.target.value });
						}}
						onBlur={validateFields}
					/>
				</div>

				<div className={classes.simpleInputContainer}>
					<InputGroup
						error={errors.capacity}
						value={capacity || ""}
						name="capacity"
						label="Qty"
						placeholder="1"
						type="number"
						onChange={e => {
							updateTicketType(index, { capacity: e.target.value });
						}}
						onBlur={validateFields}
					/>
				</div>

				<div className={classes.simpleInputContainer}>
					<InputGroup
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">$</InputAdornment>
							)
						}}
						error={errors.value}
						value={defaultPrice}
						name="value"
						label="Price"
						placeholder="35"
						type="number"
						onChange={e => {
							pricing[0].value = e.target.value;
							updateTicketType({ pricing });
						}}
						onBlur={validateFields}
					/>
				</div>
			</div>

			<Button variant="additional">Additional options</Button>
		</div>
	);
};

const TicketType = props => {
	const { classes, active } = props;

	return (
		<div className={classes.root}>
			{active ? <TicketDetails {...props} /> : <InactiveContent {...props} />}
		</div>
	);
};

TicketType.propTypes = {
	classes: PropTypes.object.isRequired,
	onEditClick: PropTypes.func.isRequired,
	deleteTicketType: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	name: PropTypes.string,
	active: PropTypes.bool,
	errors: PropTypes.object.isRequired,
	validateFields: PropTypes.func.isRequired,
	updateTicketType: PropTypes.func.isRequired
	//id: PropTypes.string,
	//capacity
	//endDate
	//increment
	//pricing
	//startDate
};

export default withStyles(styles)(TicketType);
