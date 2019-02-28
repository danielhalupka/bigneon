import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import moment from "moment";
import { withStyles, Typography } from "@material-ui/core";
import Dialog from "../../../../elements/Dialog";

import LeftAlignedSubCard from "../../../../elements/LeftAlignedSubCard";
import TicketType from "./TicketType";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import Button from "../../../../elements/Button";
import { DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME } from "./Details";

const formatForSaving = (ticketTypes, event) => {
	const ticket_types = [];

	ticketTypes.forEach(ticketType => {
		const {
			id,
			capacity,
			increment,
			name,
			pricing,
			startTime,
			saleEndTimeOption,
			endTime,
			limitPerPerson,
			priceForDisplay,
			soldOutBehavior,
			isPrivate,
			description
		} = ticketType;

		let { startDate, endDate } = ticketType;

		startDate = moment(startDate);
		if (startTime) {
			startDate = startDate.set({
				hour: startTime.get("hour"),
				minute: startTime.get("minute"),
				second: startTime.get("second")
			});
		}

		const { doorTime, eventDate } = event;

		switch (saleEndTimeOption) {
			case "door":
				endDate = moment(doorTime);
				break;
			case "start":
				endDate = moment(eventDate);
				break;
			case "close":
				endDate = event.endTime
					? moment(event.endTime)
					: moment(eventDate).add(
						DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
						"hours"
					  );
				break;
			//If no option or set to custom, assume they're updating it manually
			case "custom":
			default:
				endDate = moment(endDate);
				if (endTime) {
					endDate = endDate.set({
						hour: endTime.get("hour"),
						minute: endTime.get("minute"),
						second: endTime.get("second")
					});
				}
		}

		const ticket_pricing = [];
		pricing.forEach(pricePoint => {
			const { id, name, startTime, endTime, value } = pricePoint;

			let { startDate, endDate } = pricePoint;

			startDate = moment(startDate);
			if (startTime) {
				startDate = startDate.set({
					hour: startTime.get("hour"),
					minute: startTime.get("minute"),
					second: startTime.get("second")
				});
			}

			endDate = moment(endDate);
			if (endTime) {
				endDate = endDate.set({
					hour: endTime.get("hour"),
					minute: endTime.get("minute"),
					second: endTime.get("second")
				});
			}

			ticket_pricing.push({
				id: id ? id : undefined,
				name,
				price_in_cents: Math.round(Number(value) * 100),
				start_date: startDate.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
				end_date: endDate.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
			});
		});

		ticket_types.push({
			id,
			name,
			capacity: Number(capacity),
			increment: Number(increment),
			start_date: startDate.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
			end_date: endDate.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
			limit_per_person:
				limitPerPerson === "" ? undefined : Number(limitPerPerson),
			price_in_cents: Number(priceForDisplay) * 100,
			ticket_pricing,
			sold_out_behavior: soldOutBehavior,
			is_private: isPrivate,
			description
		});
	});

	return ticket_types;
};

const formatForInput = (ticket_types, event) => {
	const ticketTypes = [];
	ticket_types.forEach(ticket_type => {
		const {
			id,
			name,
			description,
			capacity,
			increment,
			limit_per_person,
			ticket_pricing,
			start_date,
			end_date,
			price_in_cents,
			status,
			sold_out_behavior,
			is_private
		} = ticket_type;

		const pricing = [];
		const priceAtDoor = "";
		ticket_pricing.forEach(pricePoint => {
			const { name, price_in_cents } = pricePoint;

			let startDate = null;
			if (pricePoint.start_date) {
				startDate = moment.utc(pricePoint.start_date).local();
			}

			let endDate = null;
			if (pricePoint.end_date) {
				endDate = moment.utc(pricePoint.end_date).local();
			}

			pricing.push({
				id: pricePoint.id,
				ticketId: id,
				name,
				startDate: startDate.clone(),
				startTime: startDate,
				endDate: endDate.clone(),
				endTime: endDate,
				value: price_in_cents / 100
			});

			// if (!priceAtDoor && price_in_cents) {
			// 	priceAtDoor = price_in_cents / 100;
			// }
		});

		const ticketStartDate = start_date ? moment.utc(start_date).local() : null;
		const ticketEndDate = end_date ? moment.utc(end_date).local() : null;

		let saleEndTimeOption;
		const { doorTime, eventDate, endTime } = event;
		const closeTime = endTime
			? moment(endTime)
			: moment(eventDate).add(DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME, "hours");

		if (ticketEndDate.isSame(doorTime)) {
			saleEndTimeOption = "door";
		} else if (ticketEndDate.isSame(eventDate)) {
			saleEndTimeOption = "start";
		} else if (ticketEndDate.isSame(closeTime)) {
			saleEndTimeOption = "close";
		} else {
			//If it's not the same as any of the above the user must have edited it
			saleEndTimeOption = "custom";
		}

		const ticketType = {
			id,
			name,
			description: description || "",
			capacity: capacity ? capacity : 0,
			increment: increment ? increment : 1,
			limitPerPerson: limit_per_person ? limit_per_person : "",
			startDate: ticketStartDate.clone(),
			startTime: ticketStartDate,
			saleEndTimeOption,
			endDate: ticketEndDate.clone(),
			endTime: ticketEndDate,
			priceAtDoor, //TODO get the actual value when API works
			pricing,
			showPricing: pricing.length > 0,
			priceForDisplay: price_in_cents / 100,
			status,
			soldOutBehavior: sold_out_behavior,
			isPrivate: is_private
		};

		ticketTypes.push(ticketType);
	});

	return ticketTypes;
};

const styles = theme => ({
	root: {
		paddingLeft: theme.spacing.unit * 12,
		paddingRight: theme.spacing.unit * 2,

		[theme.breakpoints.down("sm")]: {
			paddingRight: theme.spacing.unit,
			paddingLeft: theme.spacing.unit
		}
	},
	addTicketType: {
		marginRight: theme.spacing.unit * 8,
		marginLeft: theme.spacing.unit * 12,
		marginTop: theme.spacing.unit * 6,
		border: "dashed 0.7px #979797",
		borderRadius: 4,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4,
		cursor: "pointer",

		[theme.breakpoints.down("sm")]: {
			marginRight: theme.spacing.unit * 2,
			marginLeft: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 3,
			paddingBottom: theme.spacing.unit * 3
		}
	},
	addIcon: {
		width: 32,
		height: 32,
		marginRight: theme.spacing.unit,
		marginBottom: 4
	},
	addText: {
		fontSize: theme.typography.fontSize * 1.3,

		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 1.2
		}
	},
	inactiveContent: {
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2
	}
});

const validateFields = ticketTypes => {
	const errors = {};

	ticketTypes.forEach((ticket, index) => {
		const {
			id,
			eventId,
			name,
			startTime,
			saleEndTimeOption,
			endTime,
			capacity,
			increment,
			pricing,
			priceForDisplay,
			status,
			soldOutBehavior,
			isPrivate
		} = ticket;

		if (status === "Cancelled") {
			return;
		}

		let {
			startDate,
			endDate
			//limit,
		} = ticket;

		startDate = moment(startDate);
		if (startTime) {
			startDate = startDate.set({
				hour: startTime.get("hour"),
				minute: startTime.get("minute"),
				second: startTime.get("second")
			});
		}

		if (saleEndTimeOption === "custom") {
			endDate = moment(endDate);
			if (endTime) {
				endDate = endDate.set({
					hour: endTime.get("hour"),
					minute: endTime.get("minute"),
					second: endTime.get("second")
				});
			}
		}

		const ticketErrors = {};
		if (!name) {
			ticketErrors.name = "Missing ticket name.";
		}

		if (!startDate) {
			ticketErrors.startDate = "Specify the ticket start time.";
		}

		if (saleEndTimeOption === "custom") {
			if (!endDate) {
				ticketErrors.endDate = "Specify the ticket end time.";
			} else if (startDate) {
				//Start date must be before endDate
				if (endDate.diff(startDate) <= 0) {
					if (endDate.diff(startDate, "days") > -1) {
						//If it differs by less than a day, put the error on the time field instead of the date
						ticketErrors.endTime = "Off sale time must be after on sale time";
					} else {
						ticketErrors.endDate = "Off sale date must be after on sale date";
					}
				}
			}
		}

		if (!capacity) {
			ticketErrors.capacity = "Specify a valid capacity.";
		}

		if (!increment || increment < 1) {
			ticketErrors.increment = "Increment must be more than 1";
		}

		if (
			priceForDisplay === "" ||
			priceForDisplay < 0 ||
			priceForDisplay === undefined
		) {
			ticketErrors.priceForDisplay = "Tickets must have a price";
		}
		if (pricing.length) {
			const pricingErrors = {};

			//The server seems to be messing with the array orders somehow.
			const sortedPricing = [...pricing].sort((a, b) =>
				!a.startDate || !b.startDate ? 1 : a.startDate - b.startDate
			);

			const ticketStartDate = startDate;
			const ticketEndDate = endDate;

			sortedPricing.forEach((pricingItem, index) => {
				const { name, startTime, endTime, value } = pricingItem;

				let { startDate, endDate } = pricingItem;

				startDate = moment(startDate);
				if (startTime) {
					startDate = startDate.set({
						hour: startTime.get("hour"),
						minute: startTime.get("minute"),
						second: startTime.get("second")
					});
				}
				endDate = moment(endDate);
				if (endTime) {
					endDate = endDate.set({
						hour: endTime.get("hour"),
						minute: endTime.get("minute"),
						second: endTime.get("second")
					});
				}

				//Previous pricing dates needed for current row
				const previousPricing = index > 0 ? sortedPricing[index - 1] : null;
				const previousPricingEndDate = previousPricing
					? moment(previousPricing.endDate).set({
						hour: previousPricing.endTime.get("hour"),
						minute: previousPricing.endTime.get("minute"),
						second: previousPricing.endTime.get("second")
					  })
					: null;

				const pricingError = {};

				if (!name) {
					pricingError.name = "Missing pricing name.";
				}

				if (!startDate) {
					pricingError.startDate = "Specify the pricing start time.";
				} else if (ticket.startDate) {
					//On sale date for this pricing can't be sooner than event on sale time
					if (startDate && startDate.diff(ticketStartDate) < 0) {
						pricingError.startDate = "Time must be after ticket on sale time.";
					} else if (previousPricing && previousPricingEndDate) {
						//Check on sale time is after off sale time of previous pricing
						if (startDate.diff(previousPricingEndDate) < 0) {
							pricingError.startDate =
								"Time must be after previous pricing off sale time.";
						}
					}
				}

				if (!endDate) {
					pricingError.endDate = "Specify the pricing end time.";
				} else if (startDate) {
					//Off sale date for this pricing can't be sooner than pricing on sale time
					if (endDate.diff(startDate) <= 0) {
						if (endDate.diff(startDate, "days") > -1) {
							//If it differs by less than a day, put the error on the time field instead of the date
							pricingError.endTime =
								"Off sale time must be after pricing on sale time.";
						} else {
							pricingError.endDate =
								"Off sale time must be after pricing on sale time.";
						}
					}
				}

				if (Object.keys(pricingError).length > 0) {
					pricingErrors[index] = pricingError;
				}
			});

			if (Object.keys(pricingErrors).length > 0) {
				ticketErrors.pricing = pricingErrors;
			}
		}

		//If we got any errors at all
		if (Object.keys(ticketErrors).length > 0) {
			errors[index] = ticketErrors;
		}
	});

	if (Object.keys(errors).length > 0) {
		return errors;
	}

	return null;
};

@observer
class EventTickets extends Component {
	constructor(props) {
		super(props);
		this.updateTicketType = this.updateTicketType.bind(this);
		this.state = {
			deleteIndex: false,
			areYouSureDeleteTicketDialogOpen: false
		};
	}

	componentDidMount() {}

	updateTicketType(index, details) {
		eventUpdateStore.updateTicketType(index, details);
	}

	openDeleteDialog(index) {
		const { ticketTypes } = eventUpdateStore;
		const { id } = ticketTypes[index];
		if (!id) {
			this.deleteTicketType(index);
			return null;
		}
		this.setState({
			deleteIndex: index,
			areYouSureDeleteTicketDialogOpen: true
		});
	}

	deleteTicketType(index) {
		eventUpdateStore.cancelTicketType(index).then(({ result, error }) => {});
		this.onDialogClose();
	}

	onDialogClose() {
		this.setState({
			deleteIndex: false,
			areYouSureDeleteTicketDialogOpen: false
		});
	}

	renderAreYouSureDeleteDialog() {
		const { areYouSureDeleteTicketDialogOpen, deleteIndex } = this.state;
		const onClose = this.onDialogClose.bind(this);

		return (
			<Dialog
				open={areYouSureDeleteTicketDialogOpen}
				onClose={onClose}
				title="Are you sure you want to cancel this ticket?"
			>
				<div>
					<div>
						<Typography>
							Cancelling a ticket will stop any further sales of the ticket. All
							purchased tickets will stay valid.
						</Typography>
					</div>
					<div style={{ display: "flex" }}>
						<Button
							style={{ marginRight: 5, flex: 1 }}
							onClick={onClose}
							color="primary"
						>
							Cancel
						</Button>
						<Button
							style={{ marginLeft: 5, flex: 1 }}
							type="submit"
							variant="callToAction"
							onClick={() => {
								this.deleteTicketType(deleteIndex);
							}}
						>
							I Am Sure, Cancel Ticket
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	render() {
		const {
			classes,
			validateFields,
			errors,
			ticketTimesDirty,
			eventStartDate
		} = this.props;
		const { ticketTypes, ticketTypeActiveIndex } = eventUpdateStore;

		return (
			<div>
				{this.renderAreYouSureDeleteDialog()}
				{ticketTypes.map((ticketType, index) => {
					let active = index === ticketTypeActiveIndex;
					const isCancelled = ticketType.status === "Cancelled";

					const ticketTypeErrors = errors && errors[index] ? errors[index] : {};

					//If we have errors, force their eyes to see them
					if (Object.keys(ticketTypeErrors).length > 0) {
						active = true;
					}

					return (
						<LeftAlignedSubCard key={index} active={active}>
							<TicketType
								isCancelled={isCancelled}
								onEditClick={() => {
									const newIndex =
										eventUpdateStore.ticketTypeActiveIndex === index
											? null
											: index;
									eventUpdateStore.ticketTypeActivate(newIndex);
								}}
								updateTicketType={this.updateTicketType}
								deleteTicketType={() => this.openDeleteDialog(index)}
								active={active}
								index={index}
								validateFields={validateFields}
								errors={ticketTypeErrors}
								ticketTimesDirty={ticketTimesDirty}
								eventStartDate={eventStartDate}
								{...ticketType}
							/>
						</LeftAlignedSubCard>
					);
				})}

				<div
					className={classes.addTicketType}
					onClick={() => eventUpdateStore.addTicketType()}
				>
					<img className={classes.addIcon} src="/icons/add-ticket.svg"/>
					<Typography className={classes.addText} variant="body2">
						Add another ticket type
					</Typography>
				</div>
			</div>
		);
	}
}

EventTickets.propTypes = {
	validateFields: PropTypes.func.isRequired,
	eventId: PropTypes.string,
	eventStartDate: PropTypes.object.isRequired,
	errors: PropTypes.object,
	ticketTimesDirty: PropTypes.bool,
	onChangeDate: PropTypes.func,
	onDeleteTicketType: PropTypes.func
};

export const Tickets = withStyles(styles)(EventTickets);
export const formatTicketDataForInputs = formatForInput;
export const formatTicketDataForSaving = formatForSaving;
export const validateTicketTypeFields = validateFields;
