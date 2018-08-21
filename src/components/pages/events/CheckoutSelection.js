import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import moment from "moment";

import Button from "../../common/Button";
import Divider from "../../common/Divider";
import api from "../../../helpers/api";
import notifications from "../../../stores/notifications";
import TicketSelection from "./TicketSelection";
import PromoCodeDialog from "./PromoCodeDialog";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	media: {
		height: 200,
		width: "100%",
		borderRadius: theme.shape.borderRadius
	},
	descriptionDiv: {
		marginTop: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	},
	buttonsContainer: {
		justifyContent: "flex-end",
		display: "flex"
	}
});

class CheckoutSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loadedEvent: null,
			name: "",
			displayEventStartDate: null,
			openPromo: false,
			ticketPricing: [],
			ticketSelection: {}
		};
	}

	componentDidMount() {
		let eventId = null;
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			eventId = this.props.match.params.id;

			api({ auth: false })
				.get(`/events/${eventId}`)
				.then(response => {
					const {
						name,
						created_at,
						event_start,
						organization_id,
						ticket_sell_date,
						venue_id
					} = response.data;

					const displayEventStartDate = moment(event_start).format(
						"dddd, MMMM Do YYYY"
					);

					this.setState({
						name,
						displayEventStartDate,
						loadedEvent: true
					});

					//TODO this will change completely when it comes out the DB
					//Ticket groups
					const ticketPricing = [
						{
							id: "123",
							name: "General standing",
							description: "Lorem lorem lorem lorem lorem lorem lorem",
							price: 1
						},
						{
							id: "456",
							name: "VIP",
							description: "For like super important people",
							price: 999
						}
					];

					this.setState({ ticketPricing });
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false, loadedEvent: false });

					let message = "Loading event details failed.";
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
		} else {
			//TODO return 404
		}
	}

	render() {
		const { classes } = this.props;
		const {
			name,
			displayEventStartDate,
			loadedEvent,
			openPromo,
			ticketPricing,
			ticketSelection
		} = this.state;

		if (loadedEvent === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (loadedEvent === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		return (
			<Paper className={classes.card}>
				<Grid container spacing={24}>
					<Grid item xs={12} sm={8} lg={8}>
						<Typography variant="caption">
							Organization name presents
						</Typography>

						<Typography variant="display3" component="h3">
							{name}
						</Typography>

						<Typography variant="display1" component="h3">
							With supporting artists, artist 1 and artist 2
						</Typography>

						<Typography style={{ marginBottom: 20 }} variant="subheading">
							Date and time
						</Typography>

						<Typography variant="body1">{displayEventStartDate}</Typography>
						<Typography variant="body1">
							Doors: 8:00PM / Show: 9:00PM
						</Typography>
						<Typography variant="body1">This event is all ages</Typography>

						<div style={{ marginBottom: 30 }} />

						<div className={classes.descriptionDiv}>
							<Typography variant="headline">Description</Typography>
							<Typography variant="body1">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
								enim ad minim veniam.
							</Typography>
						</div>
					</Grid>

					<Grid item xs={12} sm={4} lg={4}>
						<CardMedia
							className={classes.media}
							image={`https://picsum.photos/800/400/?image=200`}
							title={name}
						/>
					</Grid>

					<Divider />

					<Grid item xs={12} sm={12} lg={12}>
						{ticketPricing.map(({ id, name, price, description }) => (
							<TicketSelection
								key={id}
								name={name}
								description={description}
								price={price}
								error={null}
								amount={ticketSelection[id]}
								onNumberChange={amount =>
									this.setState(({ ticketSelection }) => {
										ticketSelection[id] = Number(amount) < 0 ? 0 : amount;
										return { ticketSelection };
									})
								}
							/>
						))}

						<div className={classes.buttonsContainer}>
							<Button
								onClick={() => this.setState({ openPromo: true })}
								size="large"
								customClassName="default"
							>
								Apply promo code
							</Button>
							&nbsp;
							<Button size="large" customClassName="primary">
								Select tickets
							</Button>
						</div>

						<PromoCodeDialog
							open={openPromo}
							onCancel={() => this.setState({ openPromo: false })}
							onSuccess={discount => {
								console.log(discount);
								this.setState({ openPromo: false });
							}}
						/>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

CheckoutSelection.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutSelection);
