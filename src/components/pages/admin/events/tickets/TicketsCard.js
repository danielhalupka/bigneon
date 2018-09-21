import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import axios from "axios";
import { withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import Button from "../../../../common/Button";
import api from "../../../../../helpers/api";
import Bigneon from "../../../../../helpers/bigneon";
import notifications from "../../../../../stores/notifications";
import Ticket from "./Ticket";
import FormSubHeading from "../../../../common/FormSubHeading";
import Divider from "../../../../common/Divider";

//TODO consider a sliding mechanism for choosing pricing periods. Easy to see and no overlaps caused by UI.
//https://mpowaga.github.io/react-slider/

const styles = theme => ({
	paper: {
		marginBottom: theme.spacing.unit
	}
});

class TicketsCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tickets: [],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { eventId } = this.props;

		Bigneon()
			.events.tickets.index({ id: eventId })
			.then(response => {
				const { ticket_types } = response.data;
				console.log(ticket_types);

				let tickets = [];
				ticket_types.forEach(ticket_type => {
					const {
						id,
						name,
						capacity,
						ticket_pricing,
						start_date,
						end_date
					} = ticket_type;

					let pricing = [];
					ticket_pricing.forEach(pricePoint => {
						const { name, price_in_cents } = pricePoint;

						pricing.push({
							id: pricePoint.id,
							ticketId: id,
							name,
							startDate: null, //TODO get from api when available
							endDate: null, //TODO get from api when available
							value: price_in_cents / 100
						});
					});
					tickets.push(
						Ticket.Structure({
							id,
							name,
							capacity: capacity ? capacity : 0,
							startDate: start_date
								? moment(start_date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
								: null,
							endDate: end_date
								? moment(end_date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
								: null,
							pricing
						})
					);
				});

				this.setState({ tickets });

				//If there are no tickets, add one
				if (tickets.length < 1) {
					this.addTicket();
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

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		let errors = {};

		const { tickets } = this.state;
		tickets.forEach((ticket, index) => {
			const {
				id,
				eventId,
				name,
				startDate,
				endDate,
				capacity,
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
							pricingError.startDate =
								"Time must be after ticket on sale time.";
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

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			console.warn("Validation errors: ");
			console.warn(this.state.errors);
			return false;
		}

		this.setState({ isSubmitting: true });

		const { tickets } = this.state;
		const { eventId, organizationId, onNext } = this.props;

		//Build an array of promises to execute
		let ticketTypePromises = [];
		tickets.forEach(ticket => {
			const { id, capacity, name, pricing, startDate, endDate } = ticket;
			if (id) {
				//Don't post the same ticket that's already been saved.
				//TODO use an patch here instead of a post when API endpoint is available
				console.warn(
					`Not saving existing ticket type because API isn't available yet: ${name}`
				);
				return;
			}

			let ticket_pricing = [];
			pricing.forEach(pricePoint => {
				const { id, name, startDate, endDate, value } = pricePoint;

				ticket_pricing.push({
					id: id ? id : undefined,
					name,
					price_in_cents: Math.round(Number(value) * 100),
					start_date: moment
						.utc(startDate)
						.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
					end_date: moment
						.utc(endDate)
						.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
				});
			});

			const ticketDetails = {
				name,
				capacity: Number(capacity),
				start_date: moment
					.utc(startDate)
					.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
				end_date: moment
					.utc(endDate)
					.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
				ticket_pricing
			};

			//TODO use Bigneon()
			const axiosPromise = api().post(
				`/events/${eventId}/tickets`,
				ticketDetails
			);
			ticketTypePromises.push(axiosPromise);
		});

		axios
			.all(ticketTypePromises)
			.then(results => {
				console.log("Tickets: ", results);
				results.forEach(({ data }) => {
					console.log("Saved ticket: ", data);
				});

				notifications.show({
					message: "Event tickets updated.",
					variant: "success"
				});
				onNext();
			})
			.catch(error => {
				console.error(error);

				let message = `Adding tickets failed.`;
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

		this.setState({ isSubmitting: false });
	}

	addTicket() {
		let { tickets } = this.state;
		tickets.push(
			Ticket.Structure({
				startDate: null,
				endDate: null
			})
		);
		this.setState({ tickets });
	}

	render() {
		const { tickets, isSubmitting, errors } = this.state;

		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<FormSubHeading style={{ marginBottom: 40 }}>
							Ticketing
						</FormSubHeading>

						{tickets.map((ticket, index) => {
							//Only add a divider between ticket sections
							const bottomDivider =
								tickets.length - 1 > index ? (
									<Divider style={{ marginBottom: 60, marginTop: 60 }} dashed />
								) : null;
							return (
								<div key={`ticket_${index}`}>
									<Ticket
										validateFields={this.validateFields.bind(this)}
										errors={errors[index]}
										data={ticket}
										onChange={ticket => {
											let tickets = [...this.state.tickets];
											tickets.splice(index, 1, ticket);
											this.setState({ tickets });
										}}
										onError={errors => {
											const hasErrors = Object.keys(errors).length > 0;

											if (hasErrors) {
												this.setState(({ errors }) => {
													errors[index] = true;
													return { errors };
												});
											} else {
												this.setState(({ errors }) => {
													delete errors[index];
													return { errors };
												});
											}
										}}
										onDelete={() => {
											if (ticket.id) {
												notifications.show({
													message:
														"Can't yet delete a ticket type that's been saved.",
													variant: "warning"
												});
											} else {
												let tickets = [...this.state.tickets];
												tickets.splice(index, 1);
												this.setState({ tickets }, () => {
													if (this.state.tickets.length === 0) {
														this.addTicket();
													}
												});
											}
										}}
										validateFields={this.validateFields.bind(this)}
									/>

									{bottomDivider}
								</div>
							);
						})}
					</CardContent>
					<CardActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={this.addTicket.bind(this)}
						>
							Add new ticket
						</Button>
						&nbsp;
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

TicketsCard.propTypes = {
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	tickets: PropTypes.array,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(TicketsCard);
