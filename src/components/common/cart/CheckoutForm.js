import React, { Component } from "react";
import { CardElement, injectStripe } from "react-stripe-elements";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import notification from "../../../stores/notifications";
import {
	Grid,
	Typography
} from "@material-ui/core";
import Button from "../../elements/Button";
import user from "../../../stores/user";
import { fontFamilyDemiBold } from "../../styles/theme";
import Dialog from "../../elements/Dialog";
import RadioButton from "../../elements/form/RadioButton";

const styles = theme => ({
	paymentContainer: {
		padding: theme.spacing.unit * 2,
		marginTop: theme.spacing.unit * 3
		// borderStyle: "solid",
		// borderWidth: 0.5,
		// borderColor: theme.palette.grey[200],
		// borderRadius: theme.shape.borderRadius
	},
	cardInput: {
		outline: "none",
		borderStyle: "none",
		fontSize: cardFontSize,
		marginBottom: theme.spacing.unit * 3
	},
	buttonsContainer: {
		justifyContent: "flex-start",
		display: "flex",
		marginTop: theme.spacing.unit * 2
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2
	},
	paymentOptionContainer: {
		display: "flex",
		alignItems: "center",
		marginBottom: theme.spacing.unit * 2,
		cursor: "pointer"
	}
});

const cardFontSize = "18px";

class CheckoutForm extends Component {
	constructor(props) {
		super(props);

		this.onPaymentMethodChanged.bind(this);

		this.state = {
			isSubmitting: false,
			name: "",
			statusMessage: null,
			paymentMethod: null,
			allowedPaymentMethods: []
		};
	}

	componentDidMount() {
		user.refreshUser(({ firstName, lastName }) =>
			this.setState({
				name: `${firstName} ${lastName}`
			})
		);
	}

	componentWillReceiveProps(nextProps, nextContext) {
		// You don't have to do this check first, but it can help prevent an unneeded render
		if (nextProps.allowedPaymentMethods !== this.props.allowedPaymentMethods) {
			const { paymentMethod } = this.state;
			const { allowedPaymentMethods } = nextProps;
			if (allowedPaymentMethods.length === 1 && paymentMethod === null) {
				const { method, provider } = allowedPaymentMethods[0];
				const tmpPaymentMethod = `${method}|${provider}`;
				this.onPaymentMethodChanged(tmpPaymentMethod);
			}
		}
	}

	onPaymentMethodChanged(newPaymentMethod) {
		const { paymentMethod } = this.state;
		if (paymentMethod !== newPaymentMethod) {
			this.setState({ paymentMethod: newPaymentMethod });
		}
	}

	async onSubmit(e) {
		e.preventDefault();

		const { name, paymentMethod } = this.state;

		let stripeToken = null;
		if (paymentMethod === "Card|Stripe") {
			this.setState({ isSubmitting: true, statusMessage: "Authorizing..." });
			const response = await this.props.stripe.createToken({ name });

			const { error, token } = response;

			if (error) {
				const { message, type } = error;

				console.error(error);

				if (this.props.mobile) {
					// If an error is returned on a mobile app auth attempt, bypass the notification and send it back
					this.props.onMobileError(message, type);

					this.setState({ isSubmitting: false, statusMessage: null });
				} else {
					notification.show({
						message,
						variant: type === "validation_error" ? "warning" : "error"
					});

					this.setState({ isSubmitting: false, statusMessage: null });
				}
				return;
			}
			stripeToken = token;
		}
		const { onSubmit } = this.props;
		this.setState({ statusMessage: "Processing payment..." });
		const methodSplit = paymentMethod.split("|");
		onSubmit(methodSplit[0], methodSplit[1], stripeToken, () =>
			this.setState({ isSubmitting: false, statusMessage: null })
		); //extra callback for if the charge fails
	}

	renderProcessingDialog() {
		const { statusMessage } = this.state;

		return (
			<Dialog open={!!statusMessage} title={statusMessage || ""}>
				<div/>
			</Dialog>
		);
	}

	get submitButton() {
		const { isSubmitting } = this.state;

		if (this.props.mobile) {
			return isSubmitting ? "Saving details..." : "Save Payment Info";
		} else {
			return isSubmitting ? "Checking out..." : "Purchase tickets";
		}
	}

	get header() {
		if (this.props.mobile) {
			return null;
		}

		const { classes } = this.props;
		return <Typography className={classes.heading}>Payment details</Typography>;
	}

	renderPaymentSpecificDetails(newPaymentMethod) {
		const { paymentMethod } = this.state;

		if (newPaymentMethod === "Card|Stripe" && paymentMethod === "Card|Stripe") {
			const { classes, theme } = this.props;

			const placeholderColor = theme.palette.text.hint;
			const color = theme.palette.text.primary;

			const stripeStyle = {
				base: {
					color: color,
					fontSize: cardFontSize,
					"::placeholder": {
						color: placeholderColor
					},
					":-webkit-autofill": {
						color: placeholderColor
					}
				},
				invalid: {
					color: "#E25950",

					"::placeholder": {
						color: "#FFCCA5"
					}
				}
			};
			return (
				<Grid item xs={12} sm={12} lg={12} className={classes.cardInput}>
					<CardElement style={stripeStyle}/>
				</Grid>
			);
		}
		return <div/>;
	}

	render() {
		const { classes, allowedPaymentMethods, cryptoIcons } = this.props;
		const { isSubmitting, paymentMethod } = this.state;

		const iconSrc = {
			Stripe: ["credit-card-gray.svg"],
			Globee: cryptoIcons
		};
		return (
			<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
				{this.renderProcessingDialog()}
				<Grid className={classes.paymentContainer} item xs={12} sm={12} lg={12}>
					{this.header}
					<br/>
					{allowedPaymentMethods ? allowedPaymentMethods.map((method, index) => {
						const onClick = () =>
							this.onPaymentMethodChanged(
								method.method + "|" + method.provider
							);
						return (
							<div key={method.method + "|" + method.provider}>
								<div onClick={onClick} className={classes.paymentOptionContainer}>
									<RadioButton
										active={
											paymentMethod === method.method + "|" + method.provider
										}
										onClick={onClick}
									/>

									{iconSrc[method.provider].map(icon => {
										return (
											<img
												width="30"
												height="30"
												src={"/icons/" + icon}
												key={icon}
												style={{ marginRight: 2 }}
											/>
										);
									})}
								</div>

								{this.renderPaymentSpecificDetails(
									method.method + "|" + method.provider
								)}
							</div>
						);
					}) : null}
				</Grid>

				<Grid item xs={12} sm={12} lg={12}>
					<div className={classes.buttonsContainer}>
						<Button
							type="submit"
							disabled={isSubmitting || !paymentMethod}
							onClick={this.onSubmit.bind(this)}
							size="large"
							variant="callToAction"
							style={{ width: "100%" }}
						>
							{this.submitButton}
						</Button>
					</div>
				</Grid>
			</form>
		);
	}
}

CheckoutForm.defaultProps = {
	cryptoIcons: [
		"crypto/BTC.png",
		"crypto/DCR.png",
		"crypto/LNBT.png",
		"crypto/LTC.png",
		"crypto/XMR.png"
	]
};

CheckoutForm.propTypes = {
	onSubmit: PropTypes.func.isRequired,
	onMobileError: PropTypes.func,
	classes: PropTypes.object.isRequired,
	mobile: PropTypes.bool,
	allowedPaymentMethods: PropTypes.array.isRequired,
	cryptoIcons: PropTypes.arrayOf(PropTypes.string)
};

export default withStyles(styles, { withTheme: true })(
	injectStripe(CheckoutForm)
);
