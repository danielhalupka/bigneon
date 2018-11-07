import React, { Component } from "react";
import { observer } from "mobx-react";
import { Divider, withStyles } from "@material-ui/core";
import OrganizationIcon from "@material-ui/icons/GroupWork";

import notifications from "../../../../stores/notifications";
import SelectOptionDialog from "../../../common/SelectOptionDialog";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Card from "../../../elements/Card";
import CardMedia from "../../../elements/CardMedia";

import {
	Artists,
	formatArtistsForSaving,
	formatArtistsForInputs,
	updateArtistList
} from "./updateSections/Artists";
import {
	EventDetails,
	validateEventFields,
	formatEventDataForSaving,
	formatEventDataForInputs,
	updateEventDetails,
	createNewEvent
} from "./updateSections/Details";
import { Tickets, validateTicketTypeFields } from "./updateSections/Tickets";

import FormSubHeading from "../../../elements/FormSubHeading";
import Button from "../../../elements/Button";
import RadioButton from "../../../elements/form/RadioButton";
import InputGroup from "../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";

import eventUpdateStore from "../../../../stores/eventUpdate";

const styles = theme => ({
	paper: {
		marginBottom: theme.spacing.unit,
		paddingBottom: theme.spacing.unit * 5
	},
	paddedContent: {
		paddingRight: theme.spacing.unit * 12,
		paddingLeft: theme.spacing.unit * 12
	},
	spacer: {
		marginBottom: theme.spacing.unit * 10
	},
	ticketOptions: { display: "flex" },
	actions: {
		display: "flex",
		justifyContent: "space-between"
	}
});

class Event extends Component {
	constructor(props) {
		super(props);

		this.state = {
			organizations: null,
			errors: {},
			publishNow: true,
			isSubmitting: false
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const eventId = this.props.match.params.id;
			eventUpdateStore.loadDetails(eventId);
		} else {
			eventUpdateStore.clearDetails();
		}

		this.loadOrganizations();
	}

	validateFields() {
		if (this.hasSubmitted) {
			const { event, ticketTypes } = eventUpdateStore;
			const eventDetailErrors = validateEventFields(event);

			const ticketTypeErrors = validateTicketTypeFields(ticketTypes);
			if (eventDetailErrors || ticketTypeErrors) {
				console.log("Update error state");
				this.setState(
					{
						errors: {
							event: eventDetailErrors,
							ticketTypes: ticketTypeErrors
						}
					},
					() => console.log(this.state.errors)
				);

				return false;
			} else {
				this.setState({ errors: {} });
				return true;
			}
		}

		return true;
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const prevId =
			prevProps.match && prevProps.match.params && prevProps.match.params.id
				? prevProps.match.params.id
				: null;
		const currentId =
			this.props.match && this.props.match.params && this.props.match.params.id
				? this.props.match.params.id
				: null;

		//Check if the ID in the URL changed
		if (currentId && currentId !== prevId) {
			eventUpdateStore.updateEvent({ id: currentId });
		}

		//We've navigated to a url without an event id
		if (prevId && currentId === null) {
			eventUpdateStore.clearDetails();
		}
	}

	loadOrganizations() {
		Bigneon()
			.organizations.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				const organizationSelectObj = {};
				data.forEach(organization => {
					organizationSelectObj[organization.id] = organization.name;
				});

				//If there's only org then assume that ID
				if (data.length === 1) {
					eventUpdateStore.organizationId = data[0].id;
				}

				//FIXME remove this when not developing
				else if (process.env.NODE_ENV === "development") {
					eventUpdateStore.organizationId = data[0].id;
				}

				this.setState({ organizations: data, organizationSelectObj });
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

	async saveEventDetails() {
		this.hasSubmitted = true;

		if (!this.validateFields()) {
			return notifications.show({
				variant: "warning",
				message: "There are invalid event details."
			});
		}

		const result = await eventUpdateStore.saveEventDetails();
		if (!result) {
			return false;
		}

		const { id } = eventUpdateStore;
		if (id) {
			this.props.history.push(`/admin/events/${id}/edit`);
		}

		return true;
	}

	async onSaveDraft() {
		this.setState({ isSubmitting: true });

		const result = await this.saveEventDetails();

		if (result) {
			notifications.show({ variant: "success", message: "Draft saved." });
		}

		this.setState({ isSubmitting: false });
	}

	async onPublish() {
		this.setState({ isSubmitting: true });

		const result = await this.saveEventDetails();

		if (result) {
			console.log("hit publish endpoint");

			const { id } = eventUpdateStore;

			Bigneon()
				.events.publish({ id })
				.then(response => {
					this.setState({ isSubmitting: false });
					notifications.show({
						variant: "success",
						message: "Event published"
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });
					notifications.show({
						message: "Event saved but failed to publish.",
						variant: "error"
					});
				});
		} else {
			this.setState({ isSubmitting: false });
			notifications.show({
				message: "Event failed to save.",
				variant: "error"
			});
		}
	}

	@observer
	render() {
		const {
			organizations,
			organizationSelectObj,
			publishNow,
			errors,
			isSubmitting
		} = this.state;

		const { id, event, artists, organizationId } = eventUpdateStore;
		const { externalTicketsUrl, eventDate } = event;

		const { classes } = this.props;

		return (
			<div>
				<SelectOptionDialog
					iconComponent={<OrganizationIcon />}
					heading={
						organizationSelectObj
							? "Which organization does this event belong to?"
							: "Loading..."
					}
					items={organizationSelectObj || {}}
					onSelect={organizationId => {
						this.setState({ organizationId });
						const organization = organizations.find(o => {
							return o.id === organizationId;
						});

						eventUpdateStore.updateOrganizationId(organization.id);
					}}
					open={!organizationId}
					onClose={() => {}}
				/>

				<PageHeading iconUrl="/icons/events-multi.svg">
					{event ? "Update" : "Create"} event
				</PageHeading>

				{organizationId ? (
					<Card variant="form" className={classes.paper}>
						<CardMedia
							src={event.promoImageUrl}
							alt="Event promo image"
							caption="Recommended image size 1920 x 1080"
							onUrlUpdate={promoImageUrl => {
								eventUpdateStore.updateEvent({ promoImageUrl });
							}}
							noMediaTitle="Upload event image"
						/>

						<div className={classes.paddedContent}>
							<FormSubHeading>Artists</FormSubHeading>
						</div>

						{artists !== null ? (
							<Artists organizationId={organizationId} artists={artists} />
						) : null}

						<div className={classes.spacer} />

						<div className={classes.paddedContent}>
							<FormSubHeading>Event details</FormSubHeading>

							<EventDetails
								validateFields={this.validateFields.bind(this)}
								errors={errors.event || {}}
							/>

							<div className={classes.spacer} />
						</div>

						<div className={classes.paddedContent}>
							<FormSubHeading>Ticketing</FormSubHeading>

							<div className={classes.ticketOptions}>
								<RadioButton
									active={externalTicketsUrl === null}
									onClick={() =>
										eventUpdateStore.updateEvent({ externalTicketsUrl: null })
									}
								>
									BigNeon
								</RadioButton>
								<RadioButton
									active={externalTicketsUrl !== null}
									onClick={() =>
										eventUpdateStore.updateEvent({ externalTicketsUrl: "" })
									}
								>
									External event
								</RadioButton>
							</div>
						</div>

						{externalTicketsUrl !== null ? (
							<div className={classes.paddedContent}>
								<InputGroup
									error={errors.videoUrl}
									value={externalTicketsUrl}
									name="externalTicketsUrl"
									label="Link to purchase tickets externally"
									type="text"
									onChange={e =>
										eventUpdateStore.updateEvent({
											externalTicketsUrl: e.target.value
										})
									}
									placeholder="https//my-tix.com/event"
								/>
							</div>
						) : (
							<div style={{ marginTop: 30 }}>
								<Tickets
									errors={errors.ticketTypes}
									validateFields={this.validateFields.bind(this)}
									eventStartDate={eventDate}
									organizationId={organizationId}
								/>
							</div>
						)}

						<div className={classes.paddedContent}>
							<div className={classes.spacer} />

							<FormSubHeading>Publish options</FormSubHeading>

							<div className={classes.ticketOptions}>
								<RadioButton
									active={!!publishNow}
									onClick={() => this.setState({ publishNow: true })}
								>
									Immediately
								</RadioButton>
								<RadioButton
									active={!publishNow}
									onClick={() => this.setState({ publishNow: false })}
								>
									Future date
								</RadioButton>
							</div>

							{!publishNow ? (
								<DateTimePickerGroup
									type="date-time"
									//error={errors.publishDate} //FIXME
									value={event.publishDate}
									name="eventDate"
									label="Event date"
									onChange={publishDate => {
										this.onEventDetailsChange({ publishDate });
									}}
									onBlur={this.validateFields.bind(this)}
								/>
							) : null}

							<Divider style={{ marginTop: 20, marginBottom: 40 }} />

							<div className={classes.actions}>
								<div style={{ width: "45%" }}>
									<Button
										disabled={isSubmitting}
										onClick={this.onSaveDraft.bind(this)}
										size="large"
										fullWidth
									>
										Save draft
									</Button>
								</div>
								<div style={{ width: "45%" }}>
									<Button
										disabled={isSubmitting}
										onClick={this.onPublish.bind(this)}
										size="large"
										fullWidth
										variant="callToAction"
									>
										Publish
									</Button>
								</div>
							</div>
						</div>
					</Card>
				) : null}
			</div>
		);
	}
}

export default withStyles(styles)(Event);
