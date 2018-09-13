import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../common/Button";
import notifications from "../../../../../stores/notifications";
import api from "../../../../../helpers/api";
import { validEmail } from "../../../../../validators";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class FeeScheduleCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		//const { email } = this.state;

		const errors = {};

		// if (!email) {
		// 	errors.email = "Missing organization member email address.";
		// } else if (!validEmail(email)) {
		// 	errors.email = "Invalid email address.";
		// }

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });
	}

	render() {
		const { errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						{/* <InputGroup
							error={errors.email}
							value={email}
							name="email"
							label="Member invite email address"
							type="email"
							onChange={e => this.setState({ email: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/> */}
					</CardContent>
					<CardActions>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Inviting..." : "Invite user"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

FeeScheduleCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(FeeScheduleCard);
