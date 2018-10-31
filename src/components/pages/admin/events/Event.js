//TODO remove this once EventUpdate.js is done
//This will eventually became and overview of the event

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
import PublishCard from "./publish/PublishCard";
import SelectOptionDialog from "../../../common/SelectOptionDialog";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";

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
			eventId: null
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const eventId = this.props.match.params.id;
			this.loadEventDetails(eventId);
		}
	}

	loadEventDetails(eventId) {
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
			organizationSelectObj,
			organizationId
		} = this.state;
		const { classes, history } = this.props;

		if (!event) {
			return <Typography>Loading...</Typography>; //TODO get a spinner or something
		}

		return (
			<div>
				<PageHeading iconUrl="/icons/events-multi.svg">
					{event.name}
				</PageHeading>

				<Typography>Event dashboard coming soon.</Typography>
			</div>
		);
	}
}

export default withStyles(styles)(Event);
