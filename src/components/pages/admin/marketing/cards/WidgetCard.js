import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class InviteUserCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			orgMembers: [],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { email } = this.state;

		const errors = {};

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	render() {
		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<CardContent>
					<p>Widget code coming soon</p>
				</CardContent>
				<CardActions>
					<Button
						type="submit"
						style={{ marginRight: 10 }}
						variant="callToAction"
					>
						Preview Widget
					</Button>
					<Button
						type="submit"
						style={{ marginRight: 10 }}
						variant="callToAction"
					>
						Update Widget
					</Button>
				</CardActions>
			</Card>
		);
	}
}

InviteUserCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(InviteUserCard);
