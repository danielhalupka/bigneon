import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Button from "../../common/Button";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import user from "../../../stores/user";
import EventSummaryGrid from "./EventSummaryGrid";
import CreditCardForm from "../../common/CreditCardForm";
import { primaryHex } from "../../styles/theme";
import Divider from "../../common/Divider";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	buttonsContainer: {
		justifyContent: "flex-end",
		display: "flex"
	},
	ticketsContainer: {
		marginTop: theme.spacing.unit * 6,
		borderStyle: "solid",
		borderWidth: 0.5,
		borderColor: theme.palette.grey[200],
		borderRadius: theme.shape.borderRadius
	},
	ticketLineEntry: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	userContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		display: "flex",
		alignItems: "center"
	},
	userName: {
		color: primaryHex
		//paddingTop: 2
	},
	userIcon: {
		color: primaryHex,
		marginRight: theme.spacing.unit
	}
});

const TicketLineEntry = ({ col1, col2, col3, className }) => (
	<Grid alignItems="center" container className={className}>
		<Grid item xs={8} sm={8} md={6} lg={8}>
			{col1}
		</Grid>
		<Grid item xs={2} sm={2} md={6} lg={2}>
			{col2}
		</Grid>
		<Grid item xs={2} sm={2} md={6} lg={2}>
			{col3}
		</Grid>
	</Grid>
);

@observer
class CheckoutConfirmation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ticketSelection: {} //TODO load from API?
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	renderTickets() {
		const { ticketPricing } = selectedEvent;
		const { classes } = this.props;

		if (!ticketPricing) {
			return null;
		}

		return ticketPricing.map(({ id, name, price, description }) => (
			<TicketLineEntry
				key={id}
				col1={<Typography variant="body1">1 x {name}</Typography>}
				col2={<Typography variant="body1">$ {price}</Typography>}
				col3={<Typography variant="body1">{price * 1}</Typography>}
				className={classes.ticketLineEntry}
			/>
			// 	amount={ticketSelection[id]}
		));
	}

	render() {
		const { classes } = this.props;
		const { openPromo, ticketSelection } = this.state;

		const { id, eventDetails, ticketPricing } = selectedEvent;

		if (eventDetails === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (eventDetails === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		return (
			<Paper className={classes.card}>
				<EventSummaryGrid {...eventDetails} />

				<Grid container spacing={24}>
					<Grid
						item
						xs={12}
						sm={12}
						lg={12}
						className={classes.ticketsContainer}
					>
						<TicketLineEntry
							col1={<Typography variant="subheading">Ticket</Typography>}
							col2={<Typography variant="subheading">Price</Typography>}
							col3={<Typography variant="subheading">Subtotal</Typography>}
							className={classes.ticketLineEntry}
						/>
						{this.renderTickets()}

						<Divider />

						<TicketLineEntry
							col1={
								<Link
									to={`/events/${id}/tickets`}
									style={{ textDecoration: "none" }}
								>
									<Button>Change tickets</Button>
								</Link>
							}
							col2={
								<span>
									<Typography variant="body1">Service fees:</Typography>
									<Typography variant="body1">Order total:</Typography>
								</span>
							}
							col3={
								<span>
									<Typography variant="body1">$2</Typography>
									<Typography variant="body1">$4</Typography>
								</span>
							}
							className={classes.ticketLineEntry}
						/>
					</Grid>

					<Grid item xs={12} sm={12} lg={12} className={classes.userContainer}>
						<AccountCircle
							style={{ fontSize: 45 }}
							className={classes.userIcon}
						/>
						<Typography className={classes.userName} variant="body1">
							Hi, {user.firstName} {user.lastName}!
						</Typography>
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<CreditCardForm />
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<div className={classes.buttonsContainer}>
							<Button size="large" customClassName="primary">
								Purchase tickets
							</Button>
						</div>
					</Grid>
				</Grid>
			</Paper>
		);
	}
}

CheckoutConfirmation.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutConfirmation);
