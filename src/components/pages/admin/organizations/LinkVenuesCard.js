import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import SelectGroup from "../../../common/form/SelectGroup";
import InputGroup from "../../../common/form/InputGroup";
import Button from "../../../common/Button";
import user from "../../../../stores/user";
import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import { validEmail, validPhone } from "../../../../validators";
import LocationInputGroup from "../../../common/form/LocationInputGroup";
import addressTypeFromGoogleResult from "../../../../helpers/addressTypeFromGoogleResult";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class LinkVenuesCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			venueId: "",
			venues: [],
			linkedVenues: [],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		this.loadAllVenues();
		this.loadLinkedVenues();
	}

	loadAllVenues() {
		api()
			.get(`/venues`)
			.then(response => {
				const { data } = response;
				this.setState({ venues: data });
			})
			.catch(error => {
				console.error(error);

				let message = "Loading available venues failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	loadLinkedVenues() {
		const { organizationId } = this.props;

		api()
			.get(`/organizations/${organizationId}/venues`)
			.then(response => {
				const { data } = response;
				this.setState({ linkedVenues: data });
			})
			.catch(error => {
				console.error(error);

				let message = "Loading linked venues failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { venueId } = this.state;

		const errors = {};

		if (!venueId) {
			errors.venueId = "Choose a venue.";
		}

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

		const { venueId } = this.state;
		const { organizationId } = this.props;

		api()
			.post(`/venues/${venueId}/organizations`, {
				organization_id: organizationId
			})
			.then(response => {
				const { id } = response.data;
				this.setState({ isSubmitting: false, venueId: "" });

				notifications.show({
					message: "Venue linked to organization.",
					variant: "success"
				});

				this.loadLinkedVenues();
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Linking failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	renderVenues() {
		const { venueId, venues, errors } = this.state;

		const venuesObj = {};

		let lable = "";

		if (venues !== null) {
			venues.forEach(venue => {
				venuesObj[venue.id] = venue.name;
			});
			lable = "Venue to link";
		} else {
			lable = "Loading venues...";
		}

		return (
			<SelectGroup
				value={venueId}
				items={venuesObj}
				error={errors.venueId}
				name={"venues"}
				missingItemsLabel={"No available venues"}
				label={lable}
				onChange={e => {
					const venueId = e.target.value;
					this.setState({ venueId });
				}}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	render() {
		const { venueId, venues, linkedVenues, errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						{this.renderVenues()}

						{linkedVenues.map(({ id, name }) => (
							<Typography
								key={`${id}-${Math.floor(Math.random() * 1000)}`} //TODO remove this random number. When inserting duplicate venues fails, it won't throw a duplicate key error
								variant="body1"
							>
								{name}
							</Typography>
						))}
					</CardContent>
					<CardActions>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Linking..." : "Link venue"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

LinkVenuesCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(LinkVenuesCard);
