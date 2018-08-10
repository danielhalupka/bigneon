import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import LinkVenuesCard from "./LinkVenuesCard";
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

class OrganizationsUpdate extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing organization
		let organizationId = null;
		if (props.match && props.match.params && props.match.params.id) {
			organizationId = props.match.params.id;
		}

		this.state = {
			organizationId,
			name: "",
			email: "",
			owner_user_id: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			country: "",
			zip: "",
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		//If we're editing an existing org then load the current details
		//"/organizations/{id}"

		const { organizationId } = this.state;

		if (organizationId) {
			api()
				.get(`/organizations/${organizationId}`)
				.then(response => {
					const {
						owner_user_id,
						name,
						phone,
						address,
						city,
						state,
						country,
						zip
					} = response.data;

					this.setState({
						name: name || "",
						owner_user_id: owner_user_id || "",
						phone: phone || "",
						address: address || "",
						city: city || "",
						state: state || "",
						country: country || "",
						zip: zip || ""
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });
					notifications.show({
						message: "Loading organization details failed.",
						variant: "error"
					});
				});
		}
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { organizationId, name, email, address, phone } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing organization name.";
		}

		if (!organizationId) {
			if (!email) {
				errors.email = "Missing organization owner email address.";
			} else if (!validEmail(email)) {
				errors.email = "Invalid email address.";
			}
		}

		if (!address) {
			errors.address = "Missing address.";
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

	createNewOrganization(params, onSuccess) {
		api()
			.post("/organizations", params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Create organization failed.",
					variant: "error"
				});
			});
	}

	updateOrganization(id, params, onSuccess) {
		console.log(`/organizations/${id}`);
		console.log(JSON.stringify({ ...params, id }));

		//TODO REMOVE ID
		//Remove owner_user_id
		api()
			.patch(`/organizations/${id}`, { ...params })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Update organization failed.",
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
			organizationId,
			owner_user_id,
			name,
			email,
			phone,
			address,
			city,
			state,
			country,
			zip
		} = this.state;

		let orgDetails = {
			name,
			phone,
			address,
			city,
			state,
			country,
			zip
		};

		//If we're updating an existing org
		if (organizationId) {
			//orgDetails = { ...orgDetails, owner_user_id };

			this.updateOrganization(organizationId, orgDetails, () => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Organization updated",
					variant: "success"
				});

				this.props.history.push("/admin/organizations");
			});

			return;
		}

		//If we're creating an org, we need to lookup the users ID with their email address
		api()
			.get(`/users`, {
				params: {
					email
				}
			})
			.then(response => {
				const { id } = response.data;
				//Got the user ID, now create the organization
				//orgDetails = { ...orgDetails, owner_user_id: id };

				this.createNewOrganization(
					{ ...orgDetails, owner_user_id: id },
					organizationId => {
						this.updateOrganization(organizationId, orgDetails, () => {
							this.setState({ isSubmitting: false });

							notifications.show({
								message: "Organization created",
								variant: "success"
							});

							this.props.history.push("/admin/organizations");
						});
					}
				);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Failed to locate user with that email address.",
					variant: "error"
				});
			});
	}

	render() {
		const {
			organizationId,
			owner_user_id,
			name,
			email,
			address,
			phone,
			errors,
			isSubmitting
		} = this.state;
		const { classes } = this.props;

		//If a OrgOwner is editing his own organization don't allow him to change the owner email
		const isCurrentOwner = !!(owner_user_id && owner_user_id === user.id);

		const buttonText = organizationId ? {action: 'Update', acting: 'Updating...'} :{action: 'Create', acting: 'Creating...'}
		return (
			<div>
				<Typography variant="display3">
					{organizationId ? "Update" : "Create"} organization
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
										label="Organization name"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									{!isCurrentOwner ? (
										<InputGroup
											error={errors.email}
											value={email}
											name="email"
											label="Organization owner email address"
											type="email"
											onChange={e => this.setState({ email: e.target.value })}
											onBlur={this.validateFields.bind(this)}
										/>
									) : null}

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
										label="Organization address"
										address={address}
										onError={error => {
											console.error("error");
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

											this.setState({ city, state, country, zip });
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
											? organizationId
												? "Creating..."
												: "Updating..."
											: organizationId
												? "Update"
												: "Create"}
									</Button>
								</CardActions>
							</form>
						</Card>
					</Grid>

					{organizationId ? (
						<Grid item xs={12} sm={10} lg={8}>
							<LinkVenuesCard organizationId={organizationId} />
						</Grid>
					) : null}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(OrganizationsUpdate);
