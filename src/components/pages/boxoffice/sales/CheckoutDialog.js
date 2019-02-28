import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { observer } from "mobx-react";

import Dialog from "../../../elements/Dialog";
import { fontFamilyDemiBold, secondaryHex } from "../../../styles/theme";
import Divider from "../../../common/Divider";
import PaymentOptionCard from "../../../elements/PaymentOptionCard";
import { Grid, InputAdornment } from "@material-ui/core";
import InputGroup from "../../../common/form/InputGroup";
import { validEmail, validPhone } from "../../../../validators";
import Button from "../../../elements/Button";
import cart from "../../../../stores/cart";
import notifications from "../../../../stores/notifications";
import removePhoneFormatting from "../../../../helpers/removePhoneFormatting";
import { onCheckout } from "../common/helpers";

const styles = theme => ({
	content: {
		minWidth: 400,
		alignContent: "center",
		textAlign: "center"
	},
	itemRow: {
		marginTop: theme.spacing.unit * 2,
		display: "flex"
	},
	summaryHeading: {
		fontFamily: fontFamilyDemiBold
	},
	closeLink: {
		fontFamily: fontFamilyDemiBold,
		color: secondaryHex,
		cursor: "pointer"
	},
	totalHeading: {
		fontSize: theme.typography.fontSize * 0.9
	},
	paymentOptionsCard: {
		display: "flex",
		paddingTop: theme.spacing.unit,
		paddingBottom: theme.spacing.unit
	},
	guestInfoContainer: {
		textAlign: "left"
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2
	},
	changeContainer: {
		textAlign: "left",
		marginTop: theme.spacing.unit * 2
	},
	changeHeading: {
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase"
	},
	expiryTime: {
		marginTop: theme.spacing.unit,
		color: "#868F9B"
	}
});

const ItemRow = ({ classes, children }) => {
	const colStyles = [
		{ flex: 3, textAlign: "left" },
		{ flex: 2, textAlign: "right" },
		{ flex: 2, textAlign: "right" }
	];
	return (
		<div className={classes.itemRow}>
			{children.map((child, index) => (
				<div key={index} style={colStyles[index]}>
					{child}
				</div>
			))}
		</div>
	);
};

@observer
class CheckoutDialog extends React.Component {
	constructor(props) {
		super(props);

		this.defaultState = {
			paymentOption: "credit",
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			note: "",
			errors: {},
			isSubmitting: false
		};

		this.state = {
			...this.defaultState
		};
	}

	async onSubmit(e) {
		e.preventDefault();

		const { firstName, lastName, email, phone, note } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		const { error, result } = await onCheckout({ firstName, lastName, phone, email, note });

		if (error) {
			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Checkout failed."
			});
			console.error(error);
			this.props.onError(error);
		} else {
			cart.refreshCart();

			const { onClose, onSuccess } = this.props;
			this.setState(this.defaultState, () => {
				onClose();
				setTimeout(() => onSuccess({ ...result, email, phone }), 500);
			});
		}
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { firstName, lastName, email } = this.state;
		const phone = removePhoneFormatting(this.state.phone);

		const errors = {};

		if (email && !validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		if (phone && !validPhone(phone)) {
			errors.phone = "Invalid phone number.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	renderPurchaseSummary() {
		const { onClose, ticketTypes, classes } = this.props;
		const { cartSummary, ticketCount } = cart;

		if (ticketCount < 1) {
			return null;
		}

		const {
			orderTotalInCents,
			serviceFeesInCents,
			ticketItemList,
			feeItemList
		} = cartSummary;

		return (
			<div>
				<ItemRow classes={classes}>
					<Typography className={classes.summaryHeading}>Ticket</Typography>
					<Typography className={classes.summaryHeading}>Price</Typography>
					<Typography className={classes.summaryHeading}>Subtotal</Typography>
				</ItemRow>

				{ticketItemList.map((item, index) => {
					const {
						quantity,
						pricePerTicketInCents,
						feePerTicketInCents,
						ticketTypeId
					} = item;

					const name = ticketTypes[ticketTypeId]
						? ticketTypes[ticketTypeId].name
						: "Ticket";

					const subTotal = ((quantity * pricePerTicketInCents) / 100).toFixed(
						2
					);

					return (
						<div key={index}>
							<ItemRow classes={classes}>
								<Typography>
									{quantity} x {name}
								</Typography>
								<Typography>
									${(pricePerTicketInCents / 100).toFixed(2)}
								</Typography>
								<Typography>${subTotal}</Typography>
							</ItemRow>
							<Divider/>
						</div>
					);
				})}

				<ItemRow classes={classes}>
					<Typography className={classes.closeLink} onClick={onClose}>
						Change tickets
					</Typography>
					<Typography className={classes.totalHeading}>
						Service fees:
					</Typography>
					<Typography className={classes.summaryHeading}>
						${(serviceFeesInCents / 100).toFixed(2)}
					</Typography>
				</ItemRow>
				<ItemRow classes={classes}>
					<Typography>&nbsp;</Typography>
					<Typography className={classes.totalHeading}>Order total:</Typography>
					<Typography className={classes.summaryHeading}>
						${(orderTotalInCents / 100).toFixed(2)}
					</Typography>
				</ItemRow>
			</div>
		);
	}

	renderForm() {
		const { classes } = this.props;
		const {
			firstName,
			lastName,
			email,
			phone,
			note,
			errors,
			isSubmitting
		} = this.state;

		return (
			<div className={classes.guestInfoContainer}>
				<Typography className={classes.heading}>Guest information</Typography>

				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<Grid container spacing={0} justify="space-between">
						<Grid item xs={12} sm={12} md={5} lg={5}>
							<InputGroup
								error={errors.firstName}
								value={firstName}
								name="firstName"
								label="First name"
								type="text"
								onChange={e => this.setState({ firstName: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} md={5} lg={5}>
							<InputGroup
								error={errors.lastName}
								value={lastName}
								name="lastName"
								label="Last name"
								type="text"
								onChange={e => this.setState({ lastName: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} md={5} lg={5}>
							<InputGroup
								error={errors.email}
								value={email}
								name="email"
								label="Email"
								type="text"
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} md={5} lg={5}>
							<InputGroup
								error={errors.phone}
								value={phone}
								name="phone"
								label="Phone number"
								type="phone"
								onChange={e => this.setState({ phone: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} md={12} lg={12}>
							<InputGroup
								error={errors.note}
								multiline
								value={note}
								name="note"
								label="Order note"
								type="text"
								onChange={e => this.setState({ note: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
					</Grid>

					<Button
						size="large"
						disabled={isSubmitting}
						type="submit"
						style={{ width: "100%", marginLeft: 5 }}
						variant="callToAction"
					>
						{isSubmitting ? "Processing..." : "Complete order"}
					</Button>
				</form>
			</div>
		);
	}

	renderChangeCalculator() {
		const { classes } = this.props;
		const { cashTendered, errors } = this.state;
		const { cartSummary } = cart;

		if (!cartSummary) {
			return null;
		}

		const {
			orderTotalInCents,
			serviceFeesInCents,
			ticketItemList,
			feeItemList
		} = cartSummary;

		let changeDue = 0;
		const tenderedNumber = Number(cashTendered);

		if (tenderedNumber) {
			changeDue = (tenderedNumber - orderTotalInCents / 100).toFixed(2);
		}

		return (
			<Grid
				container
				spacing={0}
				justify="space-between"
				className={classes.changeContainer}
			>
				<Grid item xs={12} sm={12} md={5} lg={5}>
					<Typography className={classes.changeHeading}>
						Cash tendered
					</Typography>
					<InputGroup
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">$</InputAdornment>
							)
						}}
						error={errors.cashTendered}
						value={cashTendered}
						name="tendered"
						type="number"
						onChange={e => this.setState({ cashTendered: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>
				</Grid>
				<Grid item xs={12} sm={12} md={5} lg={5}>
					<Typography className={classes.changeHeading}>Change due</Typography>
					<Typography
						style={{ marginTop: 40 }}
						className={classes.changeHeading}
					>
						{changeDue > 0 ? `$ ${changeDue}` : ""}
					</Typography>
				</Grid>
			</Grid>
		);
	}

	render() {
		const { onClose, open, classes } = this.props;
		const { paymentOption } = this.state;
		const { formattedExpiryTime, ticketCount, cartSummary } = cart;

		const dividerStyle = { marginBottom: 15 };

		let showPaymentOptions = true;

		if (cartSummary && cartSummary.orderTotalInCents === 0) {
			showPaymentOptions = false;
		}

		return (
			<Dialog open={ticketCount > 0 && open} onClose={onClose}>
				<div className={classes.content}>
					{this.renderPurchaseSummary()}
					<Divider style={dividerStyle}/>

					{showPaymentOptions ? (
						<div>
							<div className={classes.paymentOptionsCard}>
								<PaymentOptionCard
									onClick={() => this.setState({ paymentOption: "cash" })}
									active={paymentOption === "cash"}
									type="cash"
									style={{ marginRight: 5 }}
								/>
								<PaymentOptionCard
									onClick={() => this.setState({ paymentOption: "credit" })}
									active={paymentOption === "credit"}
									type="credit"
									style={{ marginLeft: 5 }}
								/>
							</div>

							{paymentOption === "cash" ? this.renderChangeCalculator() : null}

							<Divider style={dividerStyle}/>
						</div>
					) : null}

					{this.renderForm()}
					<Typography className={classes.expiryTime}>
						Cart expired in: {formattedExpiryTime}
					</Typography>
				</div>
			</Dialog>
		);
	}
}

CheckoutDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	ticketTypes: PropTypes.object.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onError: PropTypes.func.isRequired
};

export default withStyles(styles)(CheckoutDialog);
