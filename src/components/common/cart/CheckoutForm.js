import React, { Component } from "react";
import { CardElement, injectStripe } from "react-stripe-elements";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import notification from "../../../stores/notifications";
import { Grid, Typography } from "@material-ui/core";
import Button from "../Button";
import user from "../../../stores/user";

const styles = theme => ({
	buttonsContainer: {
		justifyContent: "flex-end",
		display: "flex"
	}
});

class CheckoutForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmitting: false
		};
	}

	async onSubmit(ev) {
		this.setState({ isSubmitting: true });
		const { error, token } = await this.props.stripe.createToken({
			name: `${user.firstName} ${user.lastName}`
		});
		if (error) {
			const { message } = error;
			console.error(error);
			notification.show({ message, variant: "error" });

			this.setState({ isSubmitting: false });
		} else {
			const { onToken } = this.props;
			onToken(token, () => this.setState({ isSubmitting: false })); //extra callback for if the charge fails
		}
	}

	render() {
		const { classes, theme } = this.props;
		const { isSubmitting } = this.state;

		const stripeStyle = {
			base: theme.overrides.MuiInput.root
		};

		return (
			<div className="checkout">
				<Grid item xs={12} sm={12} lg={6}>
					<Typography variant="subheading">Payment details</Typography>
					<br />
					<CardElement style={stripeStyle} />
				</Grid>

				<Grid item xs={12} sm={12} lg={12}>
					<div className={classes.buttonsContainer}>
						<Button
							disabled={isSubmitting}
							onClick={this.onSubmit.bind(this)}
							size="large"
							customClassName="primary"
						>
							{isSubmitting ? "Checking out..." : "Purchase tickets"}
						</Button>
					</div>
				</Grid>
			</div>
		);
	}
}

CheckoutForm.propTypes = {
	onToken: PropTypes.func.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(
	injectStripe(CheckoutForm)
);
