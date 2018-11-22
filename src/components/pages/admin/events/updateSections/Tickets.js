import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import moment from "moment";
import { withStyles, Typography } from "@material-ui/core";

import Button from "../../../../elements/Button";
import Bigneon from "../../../../../helpers/bigneon";
import notifications from "../../../../../stores/notifications";
import LeftAlignedSubCard from "../../../../elements/LeftAlignedSubCard";
import TicketType from "./TicketType";
import eventUpdateStore from "../../../../../stores/eventUpdate";

const formatForSaving = ticketTypes => {
	let ticket_types = [];

	ticketTypes.forEach(ticketType => {
		const {
			id,
			capacity,
			increment,
			name,
			pricing,
			startDate,
			endDate,
			limitPerPerson
		} = ticketType;

		let ticket_pricing = [];
		pricing.forEach(pricePoint => {
			const { id, name, startDate, endDate, value } = pricePoint;
			ticket_pricing.push({
				id: id ? id : undefined,
				name,
				price_in_cents: Math.round(Number(value) * 100),
				start_date: moment(startDate)
					.utc()
					.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
				end_date: moment(endDate)
					.utc()
					.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
			});
		});

		ticket_types.push({
			id,
			name,
			capacity: Number(capacity),
			increment: Number(increment),
			start_date: moment(startDate)
				.utc()
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
			end_date: moment(endDate)
				.utc()
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
			limit_per_person:
				limitPerPerson === "" ? undefined : Number(limitPerPerson),
			ticket_pricing
		});
	});

	return ticket_types;
};

const formatForInput = ticket_types => {
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
			end_date
		} = ticket_type;

		let pricing = [];
		let priceAtDoor = "";
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
				startDate,
				endDate,
				value: price_in_cents / 100
			});

			// if (!priceAtDoor && price_in_cents) {
			// 	priceAtDoor = price_in_cents / 100;
			// }
		});

		const ticketStartDate = start_date ? moment.utc(start_date).local() : null;

		const ticketEndDate = end_date ? moment.utc(end_date).local() : null;

		const ticketType = {
			id,
			name,
			description: description || "",
			capacity: capacity ? capacity : 0,
			increment: increment ? increment : 1,
			limitPerPerson: limit_per_person ? limit_per_person : "",
			startDate: ticketStartDate,
			endDate: ticketEndDate,
			priceAtDoor, //TODO get the actual value when API works
			pricing,
			showPricing: pricing.length > 1
		};

		ticketTypes.push(ticketType);
	});

	return ticketTypes;
};

const styles = theme => ({
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
		cursor: "pointer"
	},
	addIcon: {
		width: 32,
		height: 32,
		marginRight: theme.spacing.unit
	},
	addText: {
		fontSize: 22
	}
});

const validateFields = ticketTypes => {
	let errors = {};

	ticketTypes.forEach((ticket, index) => {
		const {
			id,
			eventId,
			name,
			startDate,
			endDate,
			capacity,
			increment,
			//limit,
			pricing
		} = ticket;

		const ticketErrors = {};
		if (!name) {
			ticketErrors.name = "Missing ticket name.";
		}

		if (!startDate) {
			ticketErrors.startDate = "Specify the ticket start time.";
		}

		if (!endDate) {
			ticketErrors.endDate = "Specify the ticket end time.";
		} else if (startDate) {
			//Start date must be before endDate
			if (endDate.diff(startDate) < 0) {
				ticketErrors.endDate = "Off sale time must be after on sale time";
			}
		}

		if (!capacity) {
			ticketErrors.capacity = "Specify a valid capacity.";
		}

		if (!increment || increment < 1) {
			ticketErrors.increment = "Increment must be more than 1";
		}

		if (!pricing) {
			ticketErrors.pricing = "Add pricing for ticket.";
		} else {
			let pricingErrors = {};

			// let sorted = pricing.sort(
			// 	(a, b) => (!a.startDate || !b.startDate ? 1 : a.startDate - b.startDate)
			// );
			let sorted = pricing; //TODO place back
			sorted.forEach((pricingItem, index) => {
				const { name, startDate, endDate, value } = pricingItem;

				//Previous pricing dates needed for current row
				const previousPricing = index > 0 ? sorted[index - 1] : null;

				let pricingError = {};

				if (!name) {
					pricingError.name = "Missing pricing name.";
				}

				if (!startDate) {
					pricingError.startDate = "Specify the pricing start time.";
				} else if (ticket.startDate) {
					//On sale date for this pricing can't be sooner than event on sale time
					if (startDate && startDate.diff(ticket.startDate) < 0) {
						// console.log("startDate: ", startDate);
						// console.log("ticket.startDate: ", ticket.startDate);
						// console.log("Diff: ", startDate.diff(ticket.startDate));
						pricingError.startDate = "Time must be after ticket on sale time.";
					} else if (previousPricing && previousPricing.endDate) {
						//Check on sale time is after off sale time of previous pricing
						if (startDate.diff(previousPricing.endDate) < 0) {
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
						pricingError.endDate =
							"Off sale time must be after pricing on sale time.";
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
	}

	componentDidMount() {}

	updateTicketType(index, details) {
		eventUpdateStore.updateTicketType(index, details);
	}

	deleteTicketType(index) {
		eventUpdateStore.deleteTicketType(index);
	}

	render() {
		const { classes, validateFields, errors } = this.props;
		const { ticketTypes, ticketTypeActiveIndex } = eventUpdateStore;

		return (
			<div>
				{ticketTypes.map((ticketType, index) => {
					const active = index === ticketTypeActiveIndex;
					return (
						<LeftAlignedSubCard key={index} active={active}>
							<TicketType
								onEditClick={() => {
									const newIndex =
										eventUpdateStore.ticketTypeActiveIndex === index
											? null
											: index;
									eventUpdateStore.ticketTypeActivate(newIndex);
								}}
								updateTicketType={this.updateTicketType}
								deleteTicketType={() => this.deleteTicketType(index)}
								active={active}
								index={index}
								validateFields={validateFields}
								errors={errors && errors[index] ? errors[index] : {}}
								{...ticketType}
							/>
						</LeftAlignedSubCard>
					);
				})}

				<div
					className={classes.addTicketType}
					onClick={() => eventUpdateStore.addTicketType()}
				>
					<img className={classes.addIcon} src="/icons/add-ticket.svg" />
					<Typography className={classes.addText} variant="body2">
						Add another ticket type
					</Typography>
				</div>
			</div>
		);
	}
}

EventTickets.propTypes = {
	organizationId: PropTypes.string.isRequired,
	validateFields: PropTypes.func.isRequired,
	eventId: PropTypes.string,
	eventStartDate: PropTypes.object.isRequired,
	errors: PropTypes.object
};

export const Tickets = withStyles(styles)(EventTickets);
export const formatTicketDataForInputs = formatForInput;
export const formatTicketDataForSaving = formatForSaving;
export const validateTicketTypeFields = validateFields;
