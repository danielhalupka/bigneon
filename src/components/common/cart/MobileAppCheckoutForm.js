import React, { Component } from "react";
import { CardElement, injectStripe } from "react-stripe-elements";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import { Grid } from "@material-ui/core";
import Button from "../../elements/Button";
import user from "../../../stores/user";
import { fontFamilyDemiBold } from "../../../config/theme";
import Dialog from "../../elements/Dialog";

const styles = theme => ({
	paymentContainer: {
		padding: theme.spacing.unit * 2,
		marginTop: theme.spacing.unit * 3
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
			statusMessage: null
		};
	}

	componentDidMount() {
		user.refreshUser(({ firstName, lastName }) =>
			this.setState({
				name: `${firstName} ${lastName}`
			})
		);
	}

	async onSubmit(ev) {
		const { name } = this.state;

		this.setState({ isSubmitting: true, statusMessage: "Authorizing..." });

		const { error, token } = await this.props.stripe.createToken({ name });

		if (error) {
			const { message, type } = error;

			console.error(error);

			// If an error is returned on a mobile app auth attempt, bypass the notification and send it back
			this.props.onMobileError(message, type);

			this.setState({ isSubmitting: false, statusMessage: null });
		} else {
			const { onToken } = this.props;
			this.setState({ statusMessage: "Processing payment..." });
			onToken(token, () =>
				this.setState({ isSubmitting: false, statusMessage: null })
			); //extra callback for if the charge fails
		}
	}

	renderProcessingDialog() {
		const { statusMessage } = this.state;

		return (
			<Dialog
				open={!!statusMessage}
				title={statusMessage || ""}
			>
				<div/>
			</Dialog>
		);
	}

	get submitButton() {
		const { isSubmitting } = this.state;

		return isSubmitting ? "Saving details..." : "Save Payment Info";
	}

	render() {
		const { classes, theme } = this.props;
		const { isSubmitting } = this.state;

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
					<br/>
					<CardElement style={stripeStyle}/>
				</Grid>

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
	onToken: PropTypes.func.isRequired,
	onMobileError: PropTypes.func,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(
	injectStripe(CheckoutForm)
);