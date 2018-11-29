import React, { Component } from "react";
import { observer } from "mobx-react";
import { Divider, withStyles } from "@material-ui/core";

import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Card from "../../../elements/Card";
import CardMedia from "../../../elements/CardMedia";

import { Artists } from "./updateSections/Artists";
import { EventDetails, validateEventFields } from "./updateSections/Details";
import { Tickets, validateTicketTypeFields } from "./updateSections/Tickets";

import FormSubHeading from "../../../elements/FormSubHeading";
import Button from "../../../elements/Button";
import RadioButton from "../../../elements/form/RadioButton";
import InputGroup from "../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";

import eventUpdateStore from "../../../../stores/eventUpdate";
import user from "../../../../stores/user";

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

		this.setOrganizationId();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	setOrganizationId() {
		if (!user.currentOrganizationId) {
			this.timeout = setTimeout(this.setOrganizationId.bind(this), 100);
			return;
		}
		eventUpdateStore.updateOrganizationId(user.currentOrganizationId);
	}

	validateFields() {
		if (this.hasSubmitted) {
			const { event, ticketTypes } = eventUpdateStore;
			const eventDetailErrors = validateEventFields(event);

			const ticketTypeErrors = validateTicketTypeFields(ticketTypes);
			if (eventDetailErrors || ticketTypeErrors) {
				this.setState(
					{
						errors: {
							event: eventDetailErrors,
							ticketTypes: ticketTypeErrors
						}
					}
					//() => console.warn(this.state.errors)
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

	async saveEventDetails() {
		this.hasSubmitted = true;

		if (!this.validateFields()) {
			return notifications.show({
				variant: "warning",
				message: "There are invalid event details."
			});
		}

		const saveResponse = await eventUpdateStore.saveEventDetails();
		if (!saveResponse.result) {
			return saveResponse;
		}

		const { id } = eventUpdateStore;
		if (id) {
			this.props.history.push(`/admin/events/${id}/edit`);
		}

		return saveResponse;
	}

	async onSaveDraft() {
		this.setState({ isSubmitting: true });

		const saveResponse = await this.saveEventDetails();
		if (!saveResponse) {
			return this.setState({ isSubmitting: false });
		}

		const { result, error } = saveResponse;

		if (result) {
			notifications.show({ variant: "success", message: "Draft saved." });
		} else {
			console.error(error);
			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Failed to save draft."
			});
		}

		this.setState({ isSubmitting: false });
	}

	mapValidationErrorResponse(data) {
		let fields = Object.keys(data.fields);
		let errors = {};
		for (let i = 0; i < fields.length; i++) {
			if (/venue\./.test(fields[i])) {
				errors.venueId = data.fields[fields[i]][0].code;
			}
		}

		return {
			errors: {
				event: errors
			}
		};
	}

	async onPublish() {
		this.setState({ isSubmitting: true });

		const saveResponse = await this.saveEventDetails();
		if (!saveResponse) {
			return this.setState({ isSubmitting: false });
		}

		const { result, error } = saveResponse;

		if (result) {
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
					if (error.response && error.response.status === 422) {
						let errors = this.mapValidationErrorResponse(error.response.data);

						this.setState(errors);

						notifications.show({
							message: "Validation error.",
							variant: "error"
						});
					} else {
						notifications.show({
							message: "Event saved but failed to publish.",
							variant: "error"
						});
					}
				});
		} else {
			this.setState({ isSubmitting: false });

			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Event failed to save."
			});
		}
	}

	@observer
	render() {
		const { publishNow, errors, isSubmitting } = this.state;

		const { id, event, artists } = eventUpdateStore;
		const { externalTicketsUrl, eventDate } = event;

		const { classes } = this.props;

		return (
			<div>
				<PageHeading iconUrl="/icons/events-multi.svg">
					{event ? "Update" : "Create"} event
				</PageHeading>
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

					{artists !== null ? <Artists artists={artists} /> : null}

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
			</div>
		);
	}
}

export default withStyles(styles)(Event);
