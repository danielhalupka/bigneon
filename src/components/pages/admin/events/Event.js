import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import OrganizationIcon from "@material-ui/icons/GroupWork";

import ArtistCard from "./artists/ArtistsCard";
import DetailsCard from "./details/DetailsCard";
import notifications from "../../../../stores/notifications";
import TicketsCard from "./tickets/TicketsCard";
import SelectOptionDialog from "../../../common/SelectOptionDialog";
import Bigneon from "../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	stepperContainer: {
		backgroundColor: "transparent"
	}
});

class Event extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventId: null,
			organizationId: null,
			organizations: null,
			artists: [],
			event: {},
			organization: {},
			venue: null,
			activeStep: 0,
			completed: {}
		};
	}

	componentDidMount() {
		this.loadEventDetails();
	}

	static getDerivedStateFromProps(props, state) {
		//Check if we're editing an existing organization
		let eventId = null;
		if (props.match && props.match.params && props.match.params.id) {
			eventId = props.match.params.id;
		}

		return { eventId };
	}

	loadOrganizations() {
		Bigneon()
			.organizations.index()
			.then(response => {
				const { data } = response;
				const organizations = {};
				data.forEach(organization => {
					organizations[organization.id] = organization.name;
				});

				//If there's only org then assume that ID
				if (data.length === 1) {
					this.setState({ organizationId: data[0].id });
				}

				this.setState({ organizations });
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

	loadEventDetails() {
		const { eventId } = this.state;

		if (eventId) {
			Bigneon()
				.events.read({ id: eventId })
				.then(response => {
					const { artists, organization, venue, ...event } = response.data;
					const { organization_id } = event;
					this.setState({
						artists,
						event,
						organization,
						venue,
						organizationId: organization_id
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });

					let message = "Loading event details failed.";
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
		} else {
			this.loadOrganizations();
		}
	}

	handleStep(activeStep) {
		this.setState({ activeStep });

		this.loadEventDetails();
	}

	onComplete() {
		notifications.show({
			message: "Event updated.",
			variant: "success"
		});

		this.props.history.push("/admin/events");
	}

	render() {
		const {
			artists,
			event,
			organization,
			venue,
			activeStep,
			eventId,
			organizations,
			organizationId
		} = this.state;
		const { classes, history } = this.props;

		const steps = ["Artists", "Event details", "Ticketing"];

		return (
			<div>
				<SelectOptionDialog
					iconComponent={<OrganizationIcon />}
					heading={
						organizations
							? "Which organization does this event belong to?"
							: "Loading..."
					}
					items={organizations || {}}
					onSelect={organizationId => this.setState({ organizationId })}
					open={!organizationId}
					onClose={() => {}}
				/>

				<Typography variant="display3">
					{eventId ? "Update" : "New"} event
				</Typography>

				<Stepper
					nonLinear
					activeStep={activeStep}
					className={classes.stepperContainer}
				>
					{steps.map((label, index) => {
						return (
							<Step key={label}>
								<StepButton onClick={() => this.handleStep(index)}>
									{label}
								</StepButton>
							</Step>
						);
					})}
				</Stepper>

				{organizationId ? (
					<Grid container spacing={24}>
						<Grid item xs={12} sm={12} lg={12}>
							{activeStep === 0 ? (
								<ArtistCard
									organizationId={organizationId}
									history={history}
									eventId={eventId}
									artists={artists}
									onNext={() => this.handleStep(activeStep + 1)}
								/>
							) : null}

							{activeStep === 1 ? (
								<DetailsCard
									organizationId={organizationId}
									history={history}
									eventId={eventId}
									eventDetails={event}
									onNext={() => this.handleStep(activeStep + 1)}
								/>
							) : null}

							{activeStep === 2 ? (
								<TicketsCard
									organizationId={organizationId}
									history={history}
									eventId={eventId}
									onNext={this.onComplete.bind(this)}
								/>
							) : null}
						</Grid>
					</Grid>
				) : null}
			</div>
		);
	}
}

export default withStyles(styles)(Event);
