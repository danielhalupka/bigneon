import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import InputGroup from "../../../common/form/InputGroup";
import Button from "../../../common/Button";
import user from "../../../../stores/user";
import notifications from "../../../../stores/notifications";
import { validEmail, validPhone } from "../../../../validators";
import LocationInputGroup from "../../../common/form/LocationInputGroup";
import addressTypeFromGoogleResult from "../../../../helpers/addressTypeFromGoogleResult";
import Bigneon from "../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class OrganizationUpdateCard extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing organization
		this.state = {
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

		const { organizationId } = this.props;

		if (organizationId) {
			Bigneon()
				.organization.find({ id: organizationId })
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

					let message = "Loading organization details failed.";
					if (
						error.response &&
						error.response.data &&
						error.response.data.error
					) {
						message = error.response.data.error;
					}

					this.setState({ isSubmitting: false });
					notifications.show({
						message,
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

		const { name, email, address, phone } = this.state;
		const { organizationId } = this.props;

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
		Bigneon()
			.organization.create(params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Create organization failed.";
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

	updateOrganization(id, params, onSuccess) {
		//Remove owner_user_id
		Bigneon()
			.organization.update({ id, ...params })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.log(error);
				this.setState({ isSubmitting: false });

				let message = "Update organization failed.";
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
		const { organizationId } = this.props;

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
		Bigneon()
			.users.find({ email })
			.then(response => {
				const { id } = response.data;
				if (!id) {
					this.setState({ isSubmitting: false });
					notifications.show({
						message: "Failed to locate user with that email.",
						variant: "error"
					});
					return;
				}

				//Got the user ID, now create the organization
				this.createNewOrganization(
					{ ...orgDetails, owner_user_id: id },
					organizationId => {
						notifications.show({
							message: "Organization created",
							variant: "success"
						});

						this.setState({ isSubmitting: false }, () => {
							this.props.history.push("/admin/organizations");
						});
					}
				);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Failed to locate user by email.",
					variant: "error"
				});
			});
	}

	render() {
		const {
			owner_user_id,
			name,
			email,
			address = "",
			city = "",
			state = "",
			country = "",
			zip = "",
			latitude = "",
			longitude = "",
			phone,
			errors,
			isSubmitting
		} = this.state;

		const { organizationId } = this.props;

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

		//If a OrgOwner is editing his own organization don't allow him to change the owner email
		const isCurrentOwner = !!(owner_user_id && owner_user_id === user.id);

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
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
							addressBlock={addressBlock}
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
								this.setState({
									latitude: latLng.lat,
									longitude: latLng.lng
								});
							}}
							onFullResult={result => {
								const city = addressTypeFromGoogleResult(result, "locality");
								const state = addressTypeFromGoogleResult(
									result,
									"administrative_area_level_1"
								);
								const country = addressTypeFromGoogleResult(result, "country");

								const zip = addressTypeFromGoogleResult(result, "postal_code");

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
		);
	}
}

export default withStyles(styles)(OrganizationUpdateCard);
