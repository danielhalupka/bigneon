import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import ArtistCard from "./artists/ArtistsCard";
import DetailsCard from "./details/DetailsCard";
import api from "../../../../helpers/api";
import notifications from "../../../../stores/notifications";
import TicketsCard from "./tickets/TicketsCard";

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

		//Check if we're editing an existing organization
		let eventId = null;
		if (props.match && props.match.params && props.match.params.id) {
			eventId = props.match.params.id;
		}

		this.state = {
			eventId,
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

	loadEventDetails() {
		const { eventId } = this.state;

		if (eventId) {
			api()
				.get(`/events/${eventId}`)
				.then(response => {
					const { artists, event, organization, venue } = response.data;
					this.setState({ artists, event, organization, venue });
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
			eventId
		} = this.state;
		const { classes, history } = this.props;

		//TODO pass through event details to pre-populate components

		const steps = ["Artists", "Event details", "Ticketing"];

		return (
			<div>
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

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{activeStep === 0 ? (
							<ArtistCard
								history={history}
								eventId={eventId}
								onNext={() => this.handleStep(activeStep + 1)}
							/>
						) : null}

						{activeStep === 1 ? (
							<DetailsCard
								history={history}
								eventId={eventId}
								eventDetails={event}
								onNext={() => this.handleStep(activeStep + 1)}
							/>
						) : null}

						{activeStep === 2 ? (
							<TicketsCard
								history={history}
								eventId={eventId}
								onNext={this.onComplete.bind(this)}
							/>
						) : null}
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Event);
