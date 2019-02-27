import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { observer } from "mobx-react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import CheckoutForm from "../../common/cart/CheckoutFormWrapper";
import Button from "../../elements/Button";
import Bigneon from "../../../helpers/bigneon";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import cart from "../../../stores/cart";
import user from "../../../stores/user";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import {
	fontFamilyDemiBold,
	primaryHex,
	secondaryHex,
	fontFamily
} from "../../styles/theme";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import Divider from "../../common/Divider";
import orders from "../../../stores/orders";
import tickets from "../../../stores/tickets";
import Meta from "./Meta";
import Loader from "../../elements/loaders/Loader";
import PrivateEventDialog from "./PrivateEventDialog";

const styles = theme => ({
	root: {
		paddingBottom: theme.spacing.unit * 10
	},
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4
	},
	eventSubCardRow1: {},
	ticketLineEntry: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit
	},
	lintEntryTitle: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		textTransform: "uppercase"
	},
	lineEntryText: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		paddingRight: theme.spacing.unit
	},
	subTotal: {
		fontFamily: fontFamily,
		fontSize: theme.typography.fontSize * 0.9
	},
	userContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		display: "flex",
		alignItems: "center"
	},
	userIcon: {
		color: primaryHex,
		marginRight: theme.spacing.unit
	},
	userName: {
		color: primaryHex
		//paddingTop: 2
	},
	cartExpiry: {
		color: primaryHex,
		marginTop: theme.spacing.unit
	},
	backLink: {
		color: secondaryHex
	}
});

const TicketLineEntry = ({ col1, col2, col3, classes }) => (
	<Grid alignItems="center" container className={classes.ticketLineEntry}>
		<Grid item xs={6} sm={6} md={6} lg={6}>
			<Typography className={classes.lineEntryText}>{col1}</Typography>
		</Grid>
		<Grid item xs={3} sm={3} md={3} lg={3}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col2}
			</Typography>
		</Grid>
		<Grid item xs={3} sm={3} md={3} lg={3}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col3}
			</Typography>
		</Grid>
	</Grid>
);

const TicketLineTotal = ({ col1, col2, col3, classes }) => (
	<Grid alignItems="center" container className={classes.ticketLineEntry}>
		<Grid item xs={6} sm={6} md={6} lg={6}>
			<Typography className={classes.lineEntryText}>{col1}</Typography>
		</Grid>
		<Grid item xs={4} sm={4} md={4} lg={4}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col2}
			</Typography>
		</Grid>
		<Grid item xs={2} sm={2} md={2} lg={2}>
			<Typography
				className={classes.lineEntryText}
				style={{ textAlign: "right" }}
			>
				{col3}
			</Typography>
		</Grid>
	</Grid>
);

@observer
class CheckoutConfirmation extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		cart.refreshCart();

		//TODO
		//https://github.com/big-neon/bn-web/issues/408

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

	onFreeCheckout() {
		Bigneon()
			.cart.checkout({
				amount: 0,
				method: {
					type: "Free"
				}
			})
			.then(() => {
				cart.refreshCart();
				orders.refreshOrders();
				tickets.refreshTickets();

				notifications.show({
					message: "Checkout successful",
					variant: "success"
				});

				const { history } = this.props;
				const { id } = selectedEvent;
				if (id) {
					//If they're checking out for a specific event then we have a custom success page for them
					history.push(`/events/${id}/tickets/success`);
				} else {
					history.push(`/`); //TODO go straight to tickets when route is available
				}
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					defaultMessage: "Checkout failed.",
					error
				});
				console.error(error);
			});
	}

	onCheckout(paymentMethod, provider, stripeToken, onError) {
		let method = {
			type: paymentMethod,
			provider: provider
		};

		if (provider === "Stripe") {
			method = {
				...method,
				token: stripeToken.id,
				save_payment_method: false,
				set_default: false
			};
		}

		Bigneon()
			.cart.checkout({
				amount: cart.total_in_cents, //TODO remove this amount, we shouldn't be specifying it on the frontend
				method: method
			})
			.then(response => {

				const { data } = response;
				if (data.checkout_url) {
					window.location = data.checkout_url;
					return;
				}
				cart.refreshCart();
				orders.refreshOrders();
				tickets.refreshTickets();

				notifications.show({
					message: "Payment successful",
					variant: "success"
				});

				const { history } = this.props;
				const { id } = selectedEvent;
				if (id) {
					//If they're checking out for a specific event then we have a custom success page for them
					history.push(`/events/${id}/tickets/success`);
				} else {
					history.push(`/`); //TODO go straight to tickets when route is available
				}
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					defaultMessage: "Checkout failed.",
					error
				});
				console.error(error);
				onError();
			});
	}

	renderTickets() {
		const { classes } = this.props;
		const { cartSummary } = cart;

		if (!cartSummary) {
			return null;
		}

		const { ticketItemList } = cartSummary;

		return ticketItemList.map(item => {
			const {
				id,
				item_type,
				pricePerTicketInCents,
				quantity,
				description
			} = item;

			if (!quantity || item_type === "Fees") {
				return null;
			}

			return (
				<div key={id}>
					<TicketLineEntry
						col1={`${quantity} x ${description}`}
						col2={`$ ${(pricePerTicketInCents / 100).toFixed(2)}`}
						col3={`$ ${((pricePerTicketInCents / 100) * quantity).toFixed(2)}`}
						classes={classes}
					/>
					<Divider style={{ marginTop: 15 }}/>
				</div>
			);
		});
	}

	renderTotals() {
		const { classes } = this.props;
		const { id } = selectedEvent;
		const { cartSummary } = cart;

		if (!cartSummary) {
			return null;
		}

		const { orderTotalInCents, serviceFeesInCents } = cartSummary;

		return (
			<div>
				<TicketLineTotal
					col1={(
						<Link to={`/events/${id}/tickets`}>
							<span className={classes.backLink}>Change tickets</span>
						</Link>
					)}
					col2={<span className={classes.subTotal}>Service fees:</span>}
					col3={`$${(serviceFeesInCents / 100).toFixed(2)}`}
					classes={classes}
				/>

				<TicketLineTotal
					col1={null}
					col2={<span className={classes.subTotal}>Order total:</span>}
					col3={`$${(orderTotalInCents / 100).toFixed(2)}`}
					classes={classes}
				/>

				<Divider/>
			</div>
		);
	}

	render() {
		const { classes } = this.props;

		const { cartSummary, formattedExpiryTime } = cart;

		const { event, artists, id } = selectedEvent;

		if (event === null) {
			return (
				<div>
					<PrivateEventDialog/>
					<Loader style={{ height: 400 }}/>
				</div>
			);
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		const { promo_image_url } = event;

		const subCardContent = (
			<div className={classes.eventSubCardContent}>
				<div className={classes.eventSubCardRow1}>
					<TicketLineEntry
						key={id}
						col1={<span className={classes.lintEntryTitle}>Ticket</span>}
						col2={<span className={classes.lintEntryTitle}>Price</span>}
						col3={<span className={classes.lintEntryTitle}>Subtotal</span>}
						classes={classes}
					/>

					{this.renderTickets()}
					{this.renderTotals()}
				</div>

				{user.isAuthenticated && cartSummary ? (
					<div>
						{cartSummary.orderTotalInCents > 0 ? (
							<CheckoutForm
								onSubmit={this.onCheckout.bind(this)}
								allowedPaymentMethods={cart.allowed_payment_methods}
							/>
						) : (
							<Button
								variant="callToAction"
								style={{ width: "100%" }}
								onClick={this.onFreeCheckout.bind(this)}
							>
								Complete
							</Button>
						)}
						{formattedExpiryTime ? (
							<Typography className={classes.cartExpiry} variant="body1">
								Cart expires in {formattedExpiryTime}
							</Typography>
						) : null}
					</div>
				) : null}
			</div>
		);

		const headerHeight = 600;

		return (
			<div className={classes.root}>
				<Meta type={"checkout"} {...event}/>
				<EventHeaderImage
					variant="detailed"
					height={headerHeight}
					{...event}
					artists={artists}
				/>

				{/* Desktop */}
				<div style={{ height: headerHeight }}>
					<Hidden smDown implementation="css">
						<EventDetailsOverlayCard
							style={{
								width: "30%",
								maxWidth: 550,
								top: 180,
								right: 200,
								height: "100%"
							}}
							imageSrc={promo_image_url}
						>
							{subCardContent}
						</EventDetailsOverlayCard>
					</Hidden>

					{/* Mobile */}
					<Hidden mdUp>
						<EventDetailsOverlayCard
							style={{
								width: "100%",
								paddingLeft: 20,
								paddingRight: 20,
								top: 480
							}}
							imageSrc={promo_image_url}
						>
							{subCardContent}
						</EventDetailsOverlayCard>
					</Hidden>
				</div>
			</div>
		);
	}
}

CheckoutConfirmation.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutConfirmation);
