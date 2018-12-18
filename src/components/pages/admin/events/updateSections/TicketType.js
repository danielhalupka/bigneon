import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
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
import PricePoint from "./PricePoint";
import eventUpdateStore from "../../../../../stores/eventUpdate";

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
		title: {
			textTransform: "uppercase",
			fontFamily: "TTCommons-DemiBold"
		},
		simpleInputs: {
			display: "flex"
		},
		simpleInputContainer: {
			flex: 1,
			paddingRight: theme.spacing.unit * 4
		},
		additionalInputsRow: {
			display: "flex"
		},
		additionalInputContainer: {
			flex: 1,
			paddingRight: theme.spacing.unit * 4
		}
	};
};

const FormHeading = ({ classes, children }) => (
	<Typography className={classes.title} variant="subheading">
		{children}
	</Typography>
);

const TicketHeading = ({
	classes,
	index,
	name,
	onEditClick,
	deleteTicketType,
	active
}) => (
	<div className={classes.ticketHeader}>
		<FormHeading classes={classes}>
			{name ? `${index + 1}. ${name}` : "Add your new ticket"}
		</FormHeading>
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

const TicketDetails = observer(props => {
	const {
		index,
		classes,
		errors,
		validateFields,
		updateTicketType,
		name,
		capacity,
		startDate,
		endDate,
		priceAtDoor,
		showAdditionalOptions,
		increment,
		limitPerPerson,
		description,
		showPricing,
		pricing,
		eventStartDate,
		ticketTimesDirty
	} = props;

	let useEndDate = endDate;
	if (!ticketTimesDirty) {
		useEndDate = eventStartDate;
	}
	const defaultPrice =
		pricing && pricing[0] && pricing[0].value ? pricing[0].value : "";

	const pricingErrors = errors && errors.pricing ? errors.pricing : {};

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
							let updatedPricePoint = {
								...pricing[0],
								value: e.target.value
							};
							let updatedPricing = pricing;
							updatedPricing[0] = updatedPricePoint;
							updateTicketType(index, { pricing: updatedPricing });
						}}
						onBlur={validateFields}
					/>
				</div>
			</div>

			{!showAdditionalOptions ? (
				<Button
					variant="additional"
					onClick={() =>
						updateTicketType(index, { showAdditionalOptions: true })
					}
				>
					Additional options
				</Button>
			) : null}

			<Collapse in={!!showAdditionalOptions}>
				<div className={classes.additionalInputsRow}>
					<div className={classes.additionalInputContainer}>
						<DateTimePickerGroup
							error={errors.startDate}
							value={startDate}
							name="startDate"
							label="Sale start time"
							onChange={startDate => updateTicketType(index, { startDate })}
							onBlur={validateFields}
							minDate={false}
						/>
					</div>
					<div className={classes.additionalInputContainer}>
						<DateTimePickerGroup
							error={errors.endDate}
							value={useEndDate}
							name="endDate"
							label="Sale end time"
							onChange={endDate => {
								updateTicketType(index, { endDate });
							}}
							onBlur={validateFields}
							minDate={false}
						/>
					</div>
				</div>

				<div className={classes.additionalInputsRow}>
					<div className={classes.additionalInputContainer}>
						<InputGroup
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">$</InputAdornment>
								)
							}}
							error={errors.priceAtDoor}
							value={priceAtDoor}
							name="value"
							label="Price at door"
							placeholder="35"
							type="number"
							onChange={e => {
								updateTicketType(index, { priceAtDoor: e.target.value });
							}}
							onBlur={validateFields}
						/>
					</div>
					<div className={classes.additionalInputContainer}>
						<InputGroup
							error={errors.limitPerPerson}
							value={limitPerPerson}
							name="maxTicketsPerCustomer"
							label="Ticket limit"
							placeholder="10"
							type="number"
							onChange={e => {
								updateTicketType(index, {
									limitPerPerson: e.target.value
								});
							}}
							onBlur={validateFields}
						/>
					</div>
				</div>

				<div className={classes.additionalInputsRow}>
					<div className={classes.additionalInputContainer}>
						<InputGroup
							error={errors.increment}
							value={increment}
							name="increment"
							label="Increment"
							placeholder="1"
							type="number"
							onChange={e => {
								updateTicketType(index, { increment: e.target.value });
							}}
							onBlur={validateFields}
						/>
					</div>

					<div className={classes.additionalInputContainer}>
						<InputGroup
							error={errors.description}
							value={description}
							name="description"
							label="Ticket description"
							placeholder="More details about this ticket type"
							type="text"
							onChange={e => {
								updateTicketType(index, { description: e.target.value });
							}}
							onBlur={validateFields}
						/>
					</div>
				</div>

				{!showPricing ? (
					<div>
						<FormHeading classes={classes}>Auto price point</FormHeading>

						<Button
							variant="additional"
							onClick={() => updateTicketType(index, { showPricing: true })}
						>
							Add auto price change
						</Button>
					</div>
				) : null}

				<Collapse in={!!showPricing}>
					{pricing
						.slice()
						.sort(
							(a, b) =>
								a.startDate < b.startDate
									? -1
									: a.startDate > b.startDate
										? 1
										: 0
						)
						.map((pricePoint, pricePointIndex) => {
							return (
								<div key={pricePointIndex}>
									<FormHeading classes={classes}>
										Auto price point {pricePointIndex + 1}
									</FormHeading>
									<PricePoint
										updatePricePointDetails={pricePointDetails => {
											let updatedPricePoint = {
												...pricePoint,
												...pricePointDetails
											};
											let updatedPricing = pricing;
											updatedPricing[pricePointIndex] = updatedPricePoint;

											updateTicketType(index, { pricing: updatedPricing });
										}}
										errors={pricingErrors[pricePointIndex] || {}}
										validateFields={validateFields}
										onDelete={() =>
											eventUpdateStore.removeTicketPricing(
												index,
												pricePointIndex
											)
										}
										{...pricePoint}
									/>
								</div>
							);
						})}
					<Button
						variant="additional"
						onClick={() => eventUpdateStore.addTicketPricing(index)}
					>
						Add auto price change
					</Button>
				</Collapse>
			</Collapse>
		</div>
	);
});

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
	updateTicketType: PropTypes.func.isRequired,
	ticketTimesDirty: PropTypes.bool,
	eventStartDate: PropTypes.object
	//id: PropTypes.string,
	//capacity
	//endDate
	//increment
	//pricing
	//startDate
};

export default withStyles(styles)(TicketType);
