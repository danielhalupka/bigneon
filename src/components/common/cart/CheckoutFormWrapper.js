import React, { Component } from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import PropTypes from "prop-types";

import CheckoutForm from "./CheckoutForm";
import MobileAppCheckoutForm from "./MobileAppCheckoutForm";
import Loader from "../../elements/loaders/Loader";

class CheckoutSection extends Component {

	constructor(props) {
		super(props);
		this.state = { stripe: null };
	}

	componentDidMount() {
		if (window.Stripe) {
			this.setState({ stripe: window.Stripe(process.env.REACT_APP_STRIPE_API_KEY) });
		} else {
			document.querySelector("#stripe-js").addEventListener("load", () => {
				// Create Stripe instance once Stripe.js loads
				this.setState({ stripe: window.Stripe(process.env.REACT_APP_STRIPE_API_KEY) });
			});
		}
	}

	render() {
		const { mobile } = this.props;
		const { stripe } = this.state;

		return stripe ? (
			<StripeProvider stripe={stripe}>
				<Elements>
					{mobile ? <MobileAppCheckoutForm {...this.props}/> : <CheckoutForm {...this.props}/>}
				</Elements>
			</StripeProvider>
		) : (<Loader>Loading Payment Processor</Loader>);
	}
}

CheckoutSection.defaultProps = {
	mobile: false
};

CheckoutSection.propTypes = {
	mobile: PropTypes.bool
};

export default CheckoutSection;
