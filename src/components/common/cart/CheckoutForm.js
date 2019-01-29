import React, { Component } from "react";
import { CardElement, injectStripe, Elements } from "react-stripe-elements";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import notification from "../../../stores/notifications";
import {
	Grid,
	Typography,
	RadioGroup,
	FormControlLabel,
	Radio
} from "@material-ui/core";
import Button from "../../elements/Button";
import user from "../../../stores/user";
import { fontFamilyDemiBold } from "../../styles/theme";
import Dialog from "../../elements/Dialog";

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
		marginBottom: theme.spacing.unit
	},
	buttonsContainer: {
		justifyContent: "flex-start",
		display: "flex",
		marginTop: theme.spacing.unit * 2
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2
	}
});

const cardFontSize = "18px";

class CheckoutForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false,
			name: "",
			statusMessage: null,
			paymentMethod: null
		};
	}

	componentDidMount() {
		user.refreshUser(({ firstName, lastName }) =>
			this.setState({
				name: `${firstName} ${lastName}`
			})
		);
	}

	onPaymentMethodChanged(event) {
		this.setState({ paymentMethod: event.target.value });
	}

	async onSubmit(ev) {
		const { name, paymentMethod } = this.state;

		let stripeToken = null;
		if (paymentMethod === "Card|stripe") {
			this.setState({ isSubmitting: true, statusMessage: "Authorizing..." });
			const { error, token } = await this.props.stripe.createToken({ name });

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
		ev.preventDefault();
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

	render() {
		const { classes, theme } = this.props;
		const { isSubmitting, paymentMethod } = this.state;

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
			<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
				{this.renderProcessingDialog()}
				<Grid className={classes.paymentContainer} item xs={12} sm={12} lg={12}>
					{this.header}
					<br/>
					<RadioGroup
						value={paymentMethod}
						onChange={this.onPaymentMethodChanged.bind(this)}
					>
						{this.props.allowedPaymentMethods.map((method, index) => {
							return (
								<FormControlLabel
									key={method.method + "|" + method.provider}
									value={method.method + "|" + method.provider}
									label={method.display_name}
									control={<Radio/>}
								/>
							);
						})}
					</RadioGroup>
				</Grid>
				{paymentMethod === "Card|stripe" ? (
					<Grid item xs={12} sm={12} lg={12}>
						<CardElement style={stripeStyle}/>
					</Grid>
				) : (
					<div/>
				)}
				<Grid item xs={12} sm={12} lg={12}>
					<div className={classes.buttonsContainer}>
						<Button
							type="submit"
							disabled={isSubmitting}
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

CheckoutForm.propTypes = {
	onSubmit: PropTypes.func.isRequired,
	onMobileError: PropTypes.func,
	classes: PropTypes.object.isRequired,
	mobile: PropTypes.bool,
	allowedPaymentMethods: PropTypes.array.isRequired
};

export default withStyles(styles, { withTheme: true })(
	injectStripe(CheckoutForm)
);
