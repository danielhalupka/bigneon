import React, { Component } from "react";
import { withStyles, Collapse, Typography } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import user from "../../../../../stores/user";
import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";

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
			google_ga_key: "",
			facebook_pixel_key: "",
			errors: {},
			isSubmitting: false,
			showApiKeys: true,
		};
	}

	componentDidMount() {
		//If we're editing an existing org then load the current details
		//"/organizations/{id}"

		const { organizationId } = this.props;

		if (organizationId) {
			Bigneon()
				.organizations.read({ id: organizationId })
				.then(response => {
					const {
						owner_user_id,
						google_ga_key,
						facebook_pixel_key,
					} = response.data;

					this.setState({
						owner_user_id: owner_user_id || "",
						google_ga_key: google_ga_key || "",
						facebook_pixel_key: facebook_pixel_key || ""
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

		const { organizationId } = this.props;

		const errors = {};

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	updateOrganization(id, params, onSuccess) {
		//Remove owner_user_id
		Bigneon()
			.organizations.update({ id, ...params })
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
			google_ga_key,
			facebook_pixel_key,
		} = this.state;
		const { organizationId } = this.props;

		let orgDetails = {
			google_ga_key,
			facebook_pixel_key,
		};

		//If we're updating an existing org
		if (organizationId) {
			this.updateOrganization(organizationId, orgDetails, () => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Integrations updated",
					variant: "success"
				});

				this.props.history.push(`/admin/marketing/${organizationId}`);
			});

			return;
		}
	}

	render() {
		const {
			owner_user_id,
			errors,
			google_ga_key,
			facebook_pixel_key,
			isSubmitting
		} = this.state;

		const { organizationId } = this.props;

		const { classes } = this.props;

		//If a OrgOwner is editing his own organization don't allow him to change the owner email
		const isCurrentOwner = !!(owner_user_id && owner_user_id === user.id);

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<InputGroup
							error={errors.google_ga_key}
							value={google_ga_key}
							name="google_ga_key"
							label="Google Analytics API key"
							type="text"
							onChange={e => this.setState({ google_ga_key: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
						<InputGroup
							error={errors.facebook_pixel_key}
							value={facebook_pixel_key}
							name="facebook_pixel_key"
							label="Facebook Pixel API key"
							type="text"
							onChange={e => this.setState({ facebook_pixel_key: e.target.value })}
							onBlur={this.validateFields.bind(this)}
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
