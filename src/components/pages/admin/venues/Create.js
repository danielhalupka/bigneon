import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import InputGroup from "../../../common/form/InputGroup";
import LocationInputGroup from "../../../common/form/LocationInputGroup";
import SelectGroup from "../../../common/form/SelectGroup";

import Button from "../../../common/Button";
import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import addressTypeFromGoogleResult from "../../../../helpers/addressTypeFromGoogleResult";
import { validPhone } from "../../../../validators";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class VenuesCreate extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			address: "",
			city: "",
			state: "",
			country: "",
			zip: "",
			place_id: "",
			phone: "",
			organizationId: "",
			organizations: null,
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		api()
			.get("/organizations")
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);
				notifications.show({
					message: "Loading organizations failed.",
					variant: "error"
				});
			});
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return null;
		}

		const { name, address, organizationId, phone } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing venue name.";
		}

		if (!address) {
			errors.address = "Missing address.";
		}

		if (!organizationId) {
			errors.organizationId = "Select and organization.";
		}

		if (!phone) {
			errors.phone = "Missing phone number.";
		} else if (!validPhone(phone)) {
			errors.phone = "Invalid phone number.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	createNewVenue(params, onSuccess) {
		api()
			.post("/venues", params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Create venue failed.",
					variant: "error"
				});
			});
	}

	updateVenue(id, params, onSuccess) {
		api()
			.put(`/venues/${id}`, { ...params, id })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Update venue failed.",
					variant: "error"
				});
			});
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		const {
			name,
			organizationId,
			phone,
			address,
			city,
			state,
			country,
			place_id,
			zip
		} = this.state;

		const venueDetails = {
			name,
			organization_id: organizationId,
			phone,
			address,
			city,
			state,
			country,
			zip,
			place_id
		};

		this.createNewVenue(venueDetails, id => {
			this.updateVenue(id, venueDetails, id => {
				notifications.show({
					message: "Venue created",
					variant: "success"
				});

				this.props.history.push("/admin/venues");
			});
		});

		// api()
		// 	.post("/venues", venueDetails)
		// 	.then(response => {
		// 		const { id } = response.data;
		// 		api()
		// 			.post(`/venues/${id}`, venueDetails)
		// 			.then(() => {
		// 				this.setState({ isSubmitting: false });

		// 				notifications.show({
		// 					message: "Venue created",
		// 					variant: "success"
		// 				});

		// 				this.props.history.push("/admin/venues");
		// 			})
		// 			.catch(error => {
		// 				console.error(error);
		// 				this.setState({ isSubmitting: false });
		// 				notifications.show({
		// 					message: "Create venue failed.", //TODO add more details here
		// 					variant: "error"
		// 				});
		// 			});
		// 	})
		// 	.catch(error => {
		// 		console.error(error);
		// 		this.setState({ isSubmitting: false });
		// 		notifications.show({
		// 			message: "Create venue failed.", //TODO add more details here
		// 			variant: "error"
		// 		});
		// 	});
	}

	renderOrganizations() {
		const { organizationId, organizations, errors } = this.state;
		if (organizations === null) {
			return <Typography variant="body1">Loading organizations...</Typography>;
		}

		const organizationsObj = {};

		organizations.forEach(organization => {
			organizationsObj[organization.id] = organization.name;
		});

		return (
			<SelectGroup
				value={organizationId}
				items={organizationsObj}
				error={errors.organizationId}
				name={"organization"}
				label={"Organization"}
				onChange={e => this.setState({ organizationId: e.target.value })}
			/>
		);
	}

	render() {
		const {
			name,
			address,
			phone,
			organizations,
			errors,
			isSubmitting
		} = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">Create venue</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={10} lg={8}>
						<Card className={classes.paper}>
							<form
								noValidate
								autoComplete="off"
								onSubmit={this.onSubmit.bind(this)}
							>
								<CardContent>
									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Venue name"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									{this.renderOrganizations()}

									<InputGroup
										error={errors.phone}
										value={phone}
										name="phone"
										label="Phone number"
										type="text"
										onChange={e => this.setState({ phone: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									<LocationInputGroup
										error={errors.address}
										label="Venue location"
										address={address}
										onError={error => {
											console.error(error);
											notifications.show({
												message: `Google API error: ${error}`, //TODO add more details here
												variant: "error"
											});
										}}
										onAddressChange={address => this.setState({ address })}
										onLatLngResult={latLng => {
											console.log("latLng", latLng);
										}}
										onFullResult={result => {
											console.log(result);
											const { address_components, place_id } = result;
											const city = addressTypeFromGoogleResult(
												result,
												"locality"
											);
											const state = addressTypeFromGoogleResult(
												result,
												"administrative_area_level_1"
											);
											const country = addressTypeFromGoogleResult(
												result,
												"country"
											);

											const zip = addressTypeFromGoogleResult(
												result,
												"postal_code"
											);

											this.setState({ city, state, country, zip, place_id });
										}}
									/>
								</CardContent>

								<CardActions>
									<Button
										disabled={isSubmitting}
										type="submit"
										style={{ marginRight: 10 }}
										customClassName="callToAction"
									>
										{isSubmitting ? "Creating..." : "Create"}
									</Button>
								</CardActions>
							</form>
						</Card>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(VenuesCreate);
