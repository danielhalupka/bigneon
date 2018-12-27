import React, { Component } from "react";
import { withStyles, Grid } from "@material-ui/core";
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
					const { owner_user_id, client_event_fee_in_cents, company_event_fee_in_cents } = response.data;
					let clientEventFee = client_event_fee_in_cents
						? (client_event_fee_in_cents / 100).toFixed(2)
						: (0).toFixed(2);
					let companyEventFee = company_event_fee_in_cents
						? (company_event_fee_in_cents / 100).toFixed(2)
						: (0).toFixed(2);

					this.setState({
						owner_user_id: owner_user_id || "",
						clientEventFee,
						companyEventFee
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });
					notifications.showFromErrorResponse({
						error,
						defaultMessage: "Loading organization details failed."
					});
				});
		}
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { clientEventFee, companyEventFee } = this.state;

		const errors = {};

		if (!clientEventFee) {
			errors.clientEventFee = "Missing client event fee.";
		}

		if (!companyEventFee) {
			errors.companyEventFee = "Missing Big Neon event fee.";
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

		const { clientEventFee, companyEventFee } = this.state;
		const { organizationId } = this.props;

		let orgDetails = {
			client_event_fee_in_cents: Number(clientEventFee) * 100,
			company_event_fee_in_cents: Number(companyEventFee) * 100
		};

		Bigneon()
			.organizations.update({ id: organizationId, ...orgDetails })
			.then(() => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Per order fee updated.",
					variant: "success"
				});
			})
			.catch(error => {
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Saving fee schedule failed.",
					error
				});
			});
	}

	render() {
		const { owner_user_id, clientEventFee = 0, companyEventFee = 0, errors, isSubmitting } = this.state;
		const eventFee = Number(clientEventFee) + Number(companyEventFee);
		const { organizationId } = this.props;

		const { classes } = this.props;

		//If a OrgOwner is editing his own organization don't allow him to change the owner email
		const isCurrentOwner = !!(owner_user_id && owner_user_id === user.id);

		return (
			<div>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<Grid container spacing={24}>
						<Grid item xs={12} sm={4} lg={4}>
							<InputGroup
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									)
								}}
								error={errors.clientEventFee}
								value={clientEventFee}
								name="clientEventFee"
								label="Per order client fee"
								type="number"
								onChange={e => this.setState({ clientEventFee: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={4} lg={4}>
							<InputGroup
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									)
								}}
								error={errors.companyEventFee}
								value={companyEventFee}
								name="companyEventFee"
								label="Per order Big Neon fee"
								type="number"
								onChange={e => this.setState({ companyEventFee: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} sm={4} lg={4}>
							<InputGroup
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									)
								}}
								error={errors.eventFee}
								value={eventFee}
								disabled
								name="eventFee"
								label="Total per order fee"
								type="number"
								onChange={e => {
								}}
							/>
						</Grid>
					</Grid>

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
