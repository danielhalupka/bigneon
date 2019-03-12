import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";

import InputGroup from "../../../common/form/InputGroup";
import LocationInputGroup from "../../../common/form/LocationInputGroup";
import SelectGroup from "../../../common/form/SelectGroup";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import addressTypeFromGoogleResult from "../../../../helpers/addressTypeFromGoogleResult";
import { validPhone } from "../../../../validators";
import PageHeading from "../../../elements/PageHeading";
import removePhoneFormatting from "../../../../helpers/removePhoneFormatting";
import cloudinaryWidget from "../../../../helpers/cloudinaryWidget";
import moment from "moment-timezone";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	venueImage: {
		width: "100%",
		height: 300,
		backgroundRepeat: "no-repeat",
		backgroundSize: "50% 50%",
		borderRadius: theme.shape.borderRadius
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
			regionId: null,
			imageUrl: "",
			name: "",
			address: "",
			city: "",
			state: "",
			country: "",
			postal_code: "",
			place_id: "",
			phone: "",
			organizationId: "",
			timezone: moment.tz.guess(),
			organizations: null,
			regions: null,
			errors: {},
			isSubmitting: false,
			showManualEntry: false
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
						postal_code,
						phone,
						region_id,
						promo_image_url,
						timezone
					} = response.data;

					this.setState({
						name: name || "",
						address: address || "",
						city: city || "",
						country: country || "",
						state: state || "",
						postal_code: postal_code || "",
						phone: phone || "",
						regionId: region_id || null,
						imageUrl: promo_image_url,
						timezone: timezone || moment.tz.guess()
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });

					notifications.showFromErrorResponse({
						defaultMessage: "Loading venue details failed.",
						error
					});
				});
		}

		Bigneon()
			.regions.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ regions: data });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading regions failed.",
					error
				});
			});
		Bigneon()
			.organizations.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading organizations failed.",
					error
				});
			});
	}

	uploadWidget() {
		cloudinaryWidget(
			result => {
				const imgResult = result[0];
				const { secure_url } = imgResult;
				this.setState({ imageUrl: secure_url });
			},
			error => {
				console.error(error);

				notifications.show({
					message: "Image failed to upload.",
					variant: "error"
				});
			},
			["venue-images"],
			{
				cropping: true,
				cropping_coordinates_mode: "custom",
				cropping_aspect_ratio: 2.0
			}
		);
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return null;
		}

		const {
			organizationId,
			venueId
		} = this.state;
		const phone = removePhoneFormatting(this.state.phone);

		const errors = {};
		const required = [
			"name",
			"address",
			"city",
			"state",
			"country",
			"postal_code",
			"timezone"
		];
		required.forEach(field => {
			if (!this.state[field]) {
				errors[field] = `Missing ${field}.`;
			}
		});

		// if (!name) {
		// 	errors.name = "Missing venue name.";
		// }
		//
		// if (!address) {
		// 	errors.address = "Missing address.";
		// }

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
			.venues.update({ ...params, id })
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
			regionId,
			name,
			organizationId,
			phone,
			address,
			city,
			state,
			country,
			place_id,
			postal_code,
			timezone,
			latitude = null,
			longitude = null,
			imageUrl
		} = this.state;

		const venueDetails = {
			region_id: regionId,
			name,
			phone,
			address,
			city,
			state,
			country,
			postal_code,
			google_place_id: place_id,
			latitude,
			longitude,
			promo_image_url: imageUrl,
			timezone
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

	renderTimezones() {
		const { timezone, errors } = this.state;
		const timezones = moment.tz.names().map(name => ({
			value: name,
			label: name
		}));
		return (
			<SelectGroup
				value={timezone}
				items={timezones}
				error={errors.timezone}
				name={"timezone"}
				label={"Timezone *"}
				onChange={e => this.setState({ timezone: e.target.value })}
			/>
		);
	}

	renderOrganizations() {
		const { organizationId, organizations, errors } = this.state;
		if (organizations === null) {
			return <Typography variant="body1">Loading organizations...</Typography>;
		}

		const organizationOptions = organizations
			.map(organization => ({ value: organization.id, label: organization.name }));

		return (
			<SelectGroup
				value={organizationId}
				items={organizationOptions}
				error={errors.organizationId}
				name={"organization"}
				label={"Organization"}
				onChange={e => this.setState({ organizationId: e.target.value })}
			/>
		);
	}

	renderRegions() {
		const { regionId, regions, errors } = this.state;
		if (regions === null) {
			return <Typography variant="body1">Loading regions...</Typography>;
		}

		const regionOptions = [{ value: null, label: "No Region" }].concat(regions.map(r => ({
			value: r.id,
			label: r.name
		})));

		return (
			<SelectGroup
				value={regionId}
				items={regionOptions}
				error={errors.regionId}
				name={"region"}
				label={"Region"}
				onChange={e => this.setState({ regionId: e.target.value })}
			/>
		);
	}

	render() {
		const {
			venueId,
			regionId,
			imageUrl,
			name,
			phone,
			organizations,
			errors,
			isSubmitting,
			address = "",
			city = "",
			state = "",
			country = "",
			postal_code = "",
			latitude = null,
			longitude = null,
			showManualEntry
		} = this.state;

		const addressBlock = {
			address,
			city,
			state,
			country,
			postal_code,
			latitude,
			longitude
		};

		const { classes } = this.props;
		return (
			<div>
				<PageHeading iconUrl="/icons/venues-active.svg">
					{venueId ? "Update" : "New"} venue
				</PageHeading>

				<Grid container spacing={24}>

					<Grid item xs={12} sm={10} lg={8}>
						<Card className={classes.paper}>
							<form
								noValidate
								autoComplete="off"
								onSubmit={this.onSubmit.bind(this)}
							>

								<CardContent>
									<Grid item xs={12} sm={4} lg={4}>
										<CardMedia
											className={classes.venueImage}
											image={imageUrl || "/icons/venues-gray.svg"}
											title={name}
										/>
										<Button
											style={{ width: "100%" }}
											onClick={this.uploadWidget.bind(this)}
										>
											Upload image
										</Button>
									</Grid>
									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Venue name *"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									{!venueId ? this.renderOrganizations() : null}
									{this.renderTimezones()}
									{this.renderRegions()}
									<InputGroup
										error={errors.phone}
										value={phone}
										name="phone"
										label="Phone number *"
										type="phone"
										onChange={e => this.setState({ phone: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									<LocationInputGroup
										error={errors.address}
										errors={errors}
										label="Venue location"
										address={address}
										addressBlock={addressBlock}
										showManualEntry={showManualEntry}
										onError={error => {
											this.setState({ showManualEntry: true });
											notifications.show({
												message: `Google API error: ${error}`, //TODO add more details here
												variant: "error"
											});
										}}
										onAddressChange={address => this.setState({ address })}
										onLatLngResult={latLng => {
											this.setState({
												latitude: latLng.lat,
												longitude: latLng.lng
											});
										}}
										onFullResult={result => {
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

											const postal_code = addressTypeFromGoogleResult(
												result,
												"postal_code"
											);

											this.setState({
												city,
												state,
												country,
												postal_code,
												place_id
											});
										}}
									/>
								</CardContent>

								<CardActions>
									<Button
										disabled={isSubmitting}
										type="submit"
										style={{ marginRight: 10 }}
										variant="callToAction"
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
