import React, { Component } from "react";
import { Elements, StripeProvider } from "react-stripe-elements";
import PropTypes from "prop-types";

import CheckoutForm from "./CheckoutForm";
import MobileAppCheckoutForm from "./MobileAppCheckoutForm";

class CheckoutSection extends Component {
	render() {
		const { mobile } = this.props;

		return (
			<StripeProvider apiKey={process.env.REACT_APP_STRIPE_API_KEY}>
				<Elements>
					{mobile ? <MobileAppCheckoutForm {...this.props}/> : <CheckoutForm {...this.props}/>}
				</Elements>
			</StripeProvider>
		);
	}
}

CheckoutSection.defaultProps = {
	mobile: false
};

CheckoutSection.propTypes = {
	mobile: PropTypes.bool
};

export default CheckoutSection;
