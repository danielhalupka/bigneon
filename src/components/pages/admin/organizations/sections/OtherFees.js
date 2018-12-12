import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import user from "../../../../../stores/user";
import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({});

class OtherFees extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing organization
		this.state = {
			owner_user_id: "",
			eventFee: (0).toFixed(2),
			errors: {},
			isSubmitting: false,
			showApiKeys: false
		};
	}

	componentDidMount() {
		const { organizationId } = this.props;

		if (organizationId) {
			Bigneon()
				.organizations.read({ id: organizationId })
				.then(response => {
					const { owner_user_id, event_fee_in_cents } = response.data;

					this.setState({
						owner_user_id: owner_user_id || "",
						eventFee: event_fee_in_cents
							? (event_fee_in_cents / 100).toFixed(2)
							: (0).toFixed(2)
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

		const { eventFee } = this.state;
		const { organizationId } = this.props;

		const errors = {};

		if (!eventFee) {
			errors.eventFee = "Missing event fee.";
		}

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

		const { owner_user_id, eventFee } = this.state;
		const { organizationId } = this.props;

		let orgDetails = {
			event_fee_in_cents: Number(eventFee) * 100
		};

		//If we're updating an existing org
		if (organizationId) {
			this.updateOrganization(organizationId, orgDetails, () => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Organization updated",
					variant: "success"
				});

				this.props.history.push(`/admin/organizations/${organizationId}`);
			});

			return;
		}
	}

	render() {
		const { owner_user_id, eventFee = 0, errors, isSubmitting } = this.state;

		const { organizationId } = this.props;

		const { classes } = this.props;

		//If a OrgOwner is editing his own organization don't allow him to change the owner email
		const isCurrentOwner = !!(owner_user_id && owner_user_id === user.id);

		return (
			<div>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<InputGroup
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">$</InputAdornment>
							)
						}}
						error={errors.eventFee}
						value={eventFee}
						name="eventFee"
						label="Per order fee"
						type="number"
						onChange={e => this.setState({ eventFee: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>

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
				</form>
			</div>
		);
	}
}

export default withStyles(styles)(OtherFees);
