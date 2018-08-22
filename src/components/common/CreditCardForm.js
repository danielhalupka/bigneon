import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

import InputGroup from "./form/InputGroup";

const styles = theme => ({});

class CreditCardForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cardNumber: "",
			date: "",
			cvv: "",
			zip: "",
			errors: {}
		};
	}

	validateFields() {
		console.log("Validate");
	}

	render() {
		const { errors, cardNumber, date, cvv, zip } = this.state;

		return (
			<Grid container spacing={8}>
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="subheading">Payment details</Typography>
				</Grid>
				<Grid item xs={12} sm={12} lg={4}>
					<InputGroup
						error={errors.cardNumber}
						value={cardNumber}
						name="cardNumber"
						label="Card number"
						type="text"
						onChange={e => this.setState({ cardNumber: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>
				</Grid>

				<Grid item xs={12} sm={12} lg={4}>
					<InputGroup
						error={errors.date}
						value={date}
						name="date"
						label="Expiry date"
						type="text"
						onChange={e => this.setState({ date: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>
				</Grid>

				<Grid item xs={12} sm={6} lg={2}>
					<InputGroup
						error={errors.cvv}
						value={cvv}
						name="cvv"
						label="CVV"
						type="text"
						onChange={e => this.setState({ cvv: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>
				</Grid>

				<Grid item xs={12} sm={6} lg={2}>
					<InputGroup
						error={errors.zip}
						value={zip}
						name="zip"
						label="ZIP"
						type="text"
						onChange={e => this.setState({ zip: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>
				</Grid>
			</Grid>
		);
	}
}

CreditCardForm.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CreditCardForm);
