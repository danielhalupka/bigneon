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
import Bigneon from "../../../../helpers/bigneon";
import addressTypeFromGoogleResult from "../../../../helpers/addressTypeFromGoogleResult";
import { validPhone } from "../../../../validators";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class Venue extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing venue
		let venueId = null;
		if (props.match && props.match.params && props.match.params.id) {
			venueId = props.match.params.id;
		}

		this.state = {
			venueId,
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
		const { venueId } = this.state;

		if (venueId) {
			Bigneon()
				.venues.read({ id: venueId })
				.then(response => {
					const {
						name,
						address,
						city,
						country,
						state,
						zip,
						phone
					} = response.data;

					this.setState({
						name: name || "",
						address: address || "",
						city: city || "",
						country: country || "",
						state: state || "",
						zip: zip || "",
						phone: phone || ""
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });

					let message = "Loading venue details failed.";
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

		Bigneon()
			.organizations.index()
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);
				let message = "Loading organizations failed.";
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
			return null;
		}

		const { name, address, organizationId, phone, venueId } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing venue name.";
		}

		if (!address) {
			errors.address = "Missing address.";
		}

		if (!venueId) {
			if (!organizationId) {
				errors.organizationId = "Select and organization.";
			}
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
		Bigneon()
			.venues.create(params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Create venue failed.";
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

	updateVenue(id, params, onSuccess) {
		Bigneon()
			.venues.edit({ ...params, id })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Update venue failed.";
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

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		const {
			venueId,
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
			phone,
			address,
			city,
			state,
			country,
			zip,
			place_id
		};

		//If we're updating an existing venue
		if (venueId) {
			this.updateVenue(venueId, venueDetails, id => {
				notifications.show({
					message: "Venue updated",
					variant: "success"
				});

				this.props.history.push("/admin/venues");
			});

			return;
		}

		this.createNewVenue(
			{ ...venueDetails, organization_id: organizationId },
			id => {
				notifications.show({
					message: "Venue created",
					variant: "success"
				});

				this.props.history.push("/admin/venues");
			}
		);
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
			venueId,
			name,
			phone,
			organizations,
			errors,
			isSubmitting,
			address = "",
			city = "",
			state = "",
			country = "",
			zip = "",
			latitude = "",
			longitude = ""
		} = this.state;
		const addressBlock = {
			address,
			city,
			state,
			country,
			zip,
			latitude,
			longitude
		};
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">
					{venueId ? "Update" : "New"} venue
				</Typography>

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

									{!venueId ? this.renderOrganizations() : null}

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
										addressBlock={addressBlock}
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
											this.setState({
												latitude: latLng.lat,
												longitude: latLng.lng
											});
										}}
										onFullResult={result => {
											console.log(result);
											const { place_id } = result;
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
										{isSubmitting
											? venueId
												? "Creating..."
												: "Updating..."
											: venueId
												? "Update"
												: "Create"}
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

export default withStyles(styles)(Venue);
