import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { withStyles, Typography } from "@material-ui/core";

import Button from "../../../../elements/Button";
import Bigneon from "../../../../../helpers/bigneon";
import notifications from "../../../../../stores/notifications";
import SubCard from "../../../../elements/SubCard";
import TicketType from "./TicketType";

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

const validateFields = tickets => {
	let errors = {};

	tickets.forEach((ticket, index) => {
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

			pricing.forEach((pricingItem, index) => {
				const { name, startDate, endDate, value } = pricingItem;

				//Previous pricing dates needed for current row
				const previousPricing = index > 0 ? pricing[index - 1] : null;

				let pricingError = {};

				if (!name) {
					pricingError.name = "Missing pricing name.";
				}

				if (!startDate) {
					pricingError.startDate = "Specify the pricing start time.";
				} else if (ticket.startDate) {
					//On sale date for this pricing can't be sooner than event on sale time
					if (startDate.diff(ticket.startDate) < 0) {
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
					if (endDate.diff(startDate) < 0) {
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

class Tickets extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeIndex: null,
			tickets: []
		};

		this.updateTicketType = this.updateTicketType.bind(this);
	}

	componentDidMount() {
		const { eventId } = this.props;

		if (!eventId) {
			this.addTicketType();
			return;
		}

		Bigneon()
			.events.ticketTypes.index({ event_id: eventId })
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				const ticket_types = data;

				let tickets = [];

				if (ticket_types) {
					ticket_types.forEach(ticket_type => {
						const {
							id,
							name,
							capacity,
							increment,
							ticket_pricing,
							start_date,
							end_date
						} = ticket_type;

						let pricing = [];
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
						});

						const ticketStartDate = start_date
							? moment.utc(start_date).local()
							: null;

						const ticketEndDate = end_date
							? moment.utc(end_date).local()
							: null;

						tickets.push({
							id,
							name,
							capacity: capacity ? capacity : 0,
							increment: increment ? increment : 1,
							startDate: ticketStartDate,
							endDate: ticketEndDate,
							pricing
						});
					});
				}
				this.setState({ tickets });

				//If there are no tickets, add one
				if (tickets.length < 1) {
					this.addTicketType();
				}
			})
			.catch(error => {
				console.error(error);

				let message = "Loading event tickets failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	addTicketType() {
		const { eventStartDate } = this.props;

		this.setState(({ tickets }) => {
			tickets.push({
				name: "",
				startDate: null,
				endDate: null,
				pricing: [
					{
						startDate: new Date(),
						endDate: eventStartDate
					}
				]
			});

			return { tickets, activeIndex: tickets.length - 1 };
		});
	}

	addPricing(index) {
		//TODO check this works and implement
		const { eventStartDate } = this.props;
		this.setState(({ tickets }) => {
			const { pricing = [] } = tickets[index];

			pricing.push({
				startDate: new Date(),
				endDate: eventStartDate
			});

			tickets.pricing = pricing;

			return { tickets };
		});
	}

	updateTicketType(index, details) {
		this.setState(({ tickets }) => {
			tickets[index] = { ...tickets[index], ...details };

			return { tickets };
		});
	}

	deleteTicketType(index) {
		this.setState(({ tickets }) => {
			tickets.splice(index, 1);
			return { tickets };
		});
	}

	render() {
		const { tickets, activeIndex } = this.state;
		const { classes, validateFields } = this.props;

		return (
			<div>
				{tickets.map((ticket, index) => {
					const active = index === activeIndex; //TODO make the tickets selectable
					const errors = {}; //TODO get errors
					return (
						<SubCard key={index} active={active}>
							<TicketType
								onEditClick={() =>
									this.setState(currentState => {
										const newIndex =
											currentState.activeIndex === index ? null : index;
										return { activeIndex: newIndex };
									})
								}
								updateTicketType={this.updateTicketType}
								deleteTicketType={() => this.deleteTicketType(index)}
								active={active}
								index={index}
								validateFields={validateFields}
								errors={errors}
								{...ticket}
							/>
						</SubCard>
					);
				})}

				<div
					className={classes.addTicketType}
					onClick={this.addTicketType.bind(this)}
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

Tickets.propTypes = {
	organizationId: PropTypes.string.isRequired,
	validateFields: PropTypes.func.isRequired,
	eventId: PropTypes.string,
	eventStartDate: PropTypes.object.isRequired
};

export default withStyles(styles)(Tickets);
