import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import {
	withStyles,
	Typography,
	InputAdornment,
	Collapse,
	Hidden
} from "@material-ui/core";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import IconButton from "../../../../elements/IconButton";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import PricePoint from "./PricePoint";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import SelectGroup from "../../../../common/form/SelectGroup";

const styles = theme => {
	return {
		root: {
			paddingLeft: theme.spacing.unit * 12,
			paddingRight: theme.spacing.unit * 2,

			[theme.breakpoints.down("sm")]: {
				paddingRight: theme.spacing.unit,
				paddingLeft: theme.spacing.unit
			}
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
			paddingRight: theme.spacing.unit * 4,

			[theme.breakpoints.down("sm")]: {
				paddingRight: theme.spacing.unit
			}
		},
		additionalInputsRow: {
			display: "flex"
		},
		additionalInputContainer: {
			flex: 1,
			paddingRight: theme.spacing.unit * 4,

			[theme.breakpoints.down("sm")]: {
				paddingRight: theme.spacing.unit
			}
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
			<TicketHeading {...props}/>
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
		startTime,
		saleEndTimeOption,
		endDate,
		endTime,
		priceAtDoor,
		increment,
		limitPerPerson,
		description,
		pricing,
		eventStartDate,
		ticketTimesDirty,
		priceForDisplay,
		soldOutBehavior
	} = props;

	let useEndDate = endDate;
	let useEndTime = endTime;
	if (!ticketTimesDirty) {
		useEndDate = eventStartDate.clone();
		useEndTime = eventStartDate;
	}

	const pricingErrors = errors && errors.pricing ? errors.pricing : {};

	//If we have errors with fields under 'additional options' or 'schedule a price change', then we need to force fields to be visible
	let { showAdditionalOptions, showPricing } = props;

	if (errors && Object.keys(errors).length > 0) {
		//Check if error is not with name, capacity, priceForDisplay. If there are other errors then show additional options.
		Object.keys(errors).forEach(errorKey => {
			if (
				errorKey !== "name" &&
				errorKey !== "capacity" &&
				errorKey !== "priceForDisplay"
			) {
				showAdditionalOptions = true;
			}
		});

		if (Object.keys(pricingErrors).length > 0) {
			showAdditionalOptions = true;
			showPricing = true;
		}
	}

	const onShowAdditionalOptions = () =>
		updateTicketType(index, { showAdditionalOptions: true });

	return (
		<div className={classes.activeContent}>
			<TicketHeading {...props}/>

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
						error={errors.priceForDisplay}
						value={priceForDisplay}
						name="value"
						label="Price"
						placeholder=""
						type="number"
						onChange={e => {
							updateTicketType(index, { priceForDisplay: e.target.value });
						}}
						onBlur={validateFields}
					/>
				</div>
			</div>

			{!showAdditionalOptions ? (
				<div>
					<Hidden mdUp>
						<Button
							style={{ width: "100%" }}
							variant="additional"
							onClick={onShowAdditionalOptions}
						>
							Additional options
						</Button>
					</Hidden>
					<Hidden smDown>
						<Button variant="additional" onClick={onShowAdditionalOptions}>
							Additional options
						</Button>
					</Hidden>
				</div>
			) : null}

			<Collapse in={!!showAdditionalOptions}>
				<div className={classes.additionalInputsRow}>
					<div className={classes.additionalInputContainer}>
						<DateTimePickerGroup
							error={errors.startDate}
							value={startDate}
							name="startDate.date"
							label="Sale start date"
							type="date"
							onChange={startDate => updateTicketType(index, { startDate })}
							onBlur={validateFields}
							minDate={false}
						/>
					</div>
					<div className={classes.additionalInputContainer}>
						<DateTimePickerGroup
							error={errors.startTime}
							value={startTime}
							name="startTime"
							label="Sale start time"
							type="time"
							onChange={startTime => updateTicketType(index, { startTime })}
							onBlur={validateFields}
							minDate={false}
						/>
					</div>
				</div>
				<div className={classes.additionalInputsRow}>
					<div
						className={classes.additionalInputContainer}
						style={{ marginBottom: 10 }}
					>
						<SelectGroup
							value={saleEndTimeOption || "close"}
							items={[
								{ value: "door", label: "Event Door Time" },
								{ value: "start", label: "Event Start Time" },
								{ value: "close", label: "Event End Time" },
								{ value: "custom", label: "Custom" }
							]}
							name={"close-times"}
							label={"Ticket sale end time"}
							onChange={e => {
								updateTicketType(index, { saleEndTimeOption: e.target.value });
							}}
						/>
					</div>
				</div>
				{saleEndTimeOption === "custom" ? (
					<div className={classes.additionalInputsRow}>
						<div className={classes.additionalInputContainer}>
							<DateTimePickerGroup
								error={errors.endDate}
								value={useEndDate}
								name="endDate"
								type="date"
								label="Sale end date"
								onChange={endDate => {
									updateTicketType(index, { endDate });
								}}
								onBlur={validateFields}
								minDate={false}
							/>
						</div>
						<div className={classes.additionalInputContainer}>
							<DateTimePickerGroup
								error={errors.endTime}
								value={useEndTime}
								name="endTime"
								type="time"
								label="Sale end time"
								onChange={endTime => {
									updateTicketType(index, { endTime });
								}}
								onBlur={validateFields}
								minDate={false}
							/>
						</div>
					</div>
				) : null}

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
							placeholder=""
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
				<div className={classes.additionalInputsRow}>
					<div className={classes.additionalInputContainer}>
						<SelectGroup
							value={soldOutBehavior || "showSoldOut"}
							items={[
								{ value: "ShowSoldOut", label: "Show Sold Out" },
								{ value: "Hide", label: "Hide" }
							]}
							name={"sold-out-behavior"}
							label={"When tickets are sold out"}
							onChange={e => {
								updateTicketType(index, { soldOutBehavior: e.target.value });
							}}
						/>
					</div>
				</div>

				{!showPricing ? (
					<div>
						<FormHeading classes={classes}>Scheduled Price Changes</FormHeading>

						<Button
							variant="additional"
							onClick={() => {
								eventUpdateStore.addTicketPricing(index);
								updateTicketType(index, { showPricing: true });
							}}
						>
							Schedule a price change
						</Button>
					</div>
				) : null}

				<Collapse in={!!showPricing}>
					{pricing
						.slice()
						.sort((a, b) => {
							return a.startDate < b.startDate
								? -1
								: a.startDate > b.startDate
									? 1
									: 0;
						})
						.map((pricePoint, pricePointIndex) => {
							return (
								<div key={pricePointIndex}>
									<FormHeading classes={classes}>
										Scheduled price change {pricePointIndex + 1}
									</FormHeading>
									<PricePoint
										updatePricePointDetails={pricePointDetails => {
											const updatedPricePoint = {
												...pricePoint,
												...pricePointDetails
											};
											const updatedPricing = pricing;
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
						Schedule a price change
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
			{active ? <TicketDetails {...props}/> : <InactiveContent {...props}/>}
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
	eventStartDate: PropTypes.object,
	startDate: PropTypes.object,
	startTime: PropTypes.object,
	soldOutBehavior: PropTypes.string
	//id: PropTypes.string,
	//capacity
	//endDate
	//increment
	//pricing
	//startDate
};

export default withStyles(styles)(TicketType);
