import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";
import axios from "axios";

import Button from "../../../../common/Button";
import api from "../../../../../helpers/api";
import notifications from "../../../../../stores/notifications";
import Ticket from "./Ticket";
import FormSubHeading from "../../../../common/FormSubHeading";
import Divider from "../../../../common/Divider";

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

		api()
			.get(`/events/${eventId}/tickets`)
			.then(response => {
				console.log(response.data);
				const { ticket_types } = response.data;

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
							startDate: null,
							endDate: null,
							value: price_in_cents / 100
						});
					});
					console.log(pricing);
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
							pricing: ticket_pricing
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

		const errors = {};
		//TODO validation

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

			//TODO add missing fields when added
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

			console.log("To save: ", ticketDetails);

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
				let ticketPricesPromises = [];
				results.forEach(({ data }) => {
					console.log("saved data: ", data);
					//Now save ticket pricing
					// /ticket-pricing
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
										data={ticket}
										onChange={ticket => {
											let tickets = [...this.state.tickets];
											tickets.splice(index, 1, ticket);
											this.setState({ tickets });
										}}
										onError={errors => {
											console.log("Ticket errors");
											console.log(errors);
											//TODO place back and test
											// const hasError =
											// 	this.ticketErrors && Object.keys(errors).length > 0;

											// if (Object.keys(errors).length>0) {
											// 	this.setState(({errors}) => {
											// 		errors[index] = true;
											// 		return {errors};
											// 	})

											// 	//this.ticketErrors[index] = true;
											// } else {
											// 	delete this.ticketErrors[index];
											// }
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
