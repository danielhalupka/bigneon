import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import axios from "axios";

import InputGroup from "../../../common/form/InputGroup";
import SelectGroup from "../../../common/form/SelectGroup";

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

class OrganizationsCreate extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			email: "",
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

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { name, email, address, phone } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing organization name.";
		}

		if (!email) {
			errors.email = "Missing organization owner email address.";
		} else if (!validEmail(email)) {
			errors.email = "Invalid email address.";
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
		api()
			.put(`/organizations/${id}`, { ...params, id })
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
			name,
			email,
			phone,
			address,
			city,
			state,
			country,
			zip
		} = this.state;

		api()
			.get(`/users`, {
				params: {
					email
				}
			})
			.then(response => {
				const { id } = response.data;
				//Got the user ID, now create the organization

				const orgDetails = {
					name,
					phone,
					address,
					city,
					state,
					country,
					zip,
					owner_user_id: id
				};

				this.createNewOrganization(orgDetails, organizationId => {
					this.updateOrganization(organizationId, orgDetails, () => {
						this.setState({ isSubmitting: false });

						notifications.show({
							message: "Organization created",
							variant: "success"
						});

						this.props.history.push("/admin/organizations");
					});
				});
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
		const { name, email, address, phone, errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">Create organization</Typography>

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

									<InputGroup
										error={errors.email}
										value={email}
										name="email"
										label="Organization owner email address"
										type="email"
										onChange={e => this.setState({ email: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

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

export default withStyles(styles)(OrganizationsCreate);
