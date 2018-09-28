import React, { Component } from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import CheckoutForm from "./CheckoutForm";

class CheckoutSection extends Component {
	render() {
		return (
			<StripeProvider apiKey={process.env.REACT_APP_STRIPE_API_KEY}>
				<Elements>
					<CheckoutForm {...this.props} />
				</Elements>
			</StripeProvider>
		);
	}
}

export default CheckoutSection;
