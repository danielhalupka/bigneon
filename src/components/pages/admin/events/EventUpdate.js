import React, { Component } from "react";
import { observer } from "mobx-react";
import { Divider, withStyles, Typography } from "@material-ui/core";
import moment from "moment";

import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Card from "../../../elements/Card";
import PromoImage from "./updateSections/PromoImage";
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
import ImportPreviousEventDialog from "./ImportPreviousEventDialog";

const styles = theme => ({
	paper: {
		marginBottom: theme.spacing.unit,
		paddingBottom: theme.spacing.unit * 5
	},
	paddedContent: {
		paddingRight: theme.spacing.unit * 12,
		paddingLeft: theme.spacing.unit * 12,
		[theme.breakpoints.down("sm")]: {
			paddingRight: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2
		}
	},
	spacer: {
		marginBottom: theme.spacing.unit * 10
	},
	ticketOptions: { display: "flex" },
	actions: {
		display: "flex",
		justifyContent: "space-around",
		alignItems: "center"
	},
	publishDateContainer: {
		marginTop: 20,
		display: "flex"
	},
	publishedAt: {
		marginTop: 20
	}
});

@observer
class Event extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			isSubmitting: false,
			//When ticket times are dirty, don't mess with the timing
			ticketTimesDirty: false,
			showImportPreviousEventDialog: false
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			this.eventId = this.props.match.params.id;
			eventUpdateStore.loadDetails(this.eventId);
			//On loading an event, don't automatically change ticket times
			this.setState({ ticketTimesDirty: true });
		} else {
			eventUpdateStore.clearDetails();

			this.setState({ showImportPreviousEventDialog: true });
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

	validateArtists(artists) {
		const errors = {};
		artists.forEach((artist, index) => {
			if (artist.setTime && !artist.setTime.isValid()) {
				errors[index] = { setTime: "Set time is not valid" };
			}
		});
		if (Object.keys(errors).length > 0) {
			return errors;
		}

		return null;
	}

	validateFields() {
		if (this.hasSubmitted) {
			const { event, ticketTypes, artists } = eventUpdateStore;
			const { isExternal } = event;
			const artistsErrors = this.validateArtists(artists);

			const eventDetailErrors = validateEventFields(event);

			const ticketTypeErrors = validateTicketTypeFields(
				isExternal ? [] : ticketTypes
			);
			if (artistsErrors || eventDetailErrors || ticketTypeErrors) {
				this.setState({
					errors: {
						event: eventDetailErrors,
						ticketTypes: ticketTypeErrors,
						artists: artistsErrors
					}
				});

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
			this.eventId = currentId;
			eventUpdateStore.updateEvent({ id: currentId });
		}

		//We've navigated to a url without an event id
		if (prevId && currentId === null) {
			eventUpdateStore.clearDetails();
		}
	}

	updateUrl(id) {
		if (id) {
			this.props.history.push(`/admin/events/${id}/edit`);
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

		const saveResponse = await eventUpdateStore.saveEventDetails(
			this.updateUrl.bind(this)
		);

		if (!saveResponse.result) {
			return saveResponse;
		}

		const { id } = eventUpdateStore;
		this.updateUrl(id);

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
			eventUpdateStore.loadDetails(this.eventId);
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
		const fields = Object.keys(data.fields);
		const errors = {};
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

	async onUpdate() {
		this.setState({ isSubmitting: true });

		const saveResponse = await this.saveEventDetails();
		if (!saveResponse) {
			return this.setState({ isSubmitting: false });
		}

		const { result, error } = saveResponse;

		if (result) {
			const { id, event } = eventUpdateStore;

			//If they checked the 'Unpublish' checkbox under 'Publish options'
			if (event.shouldUnpublish) {
				this.unPublishEvent(id);
			} else {
				this.publishEvent(id);
			}
		} else {
			this.setState({ isSubmitting: false });

			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Event failed to save."
			});
		}
	}

	publishEvent(id) {
		Bigneon()
			.events.publish({ id })
			.then(response => {
				this.setState({ isSubmitting: false });
				eventUpdateStore.loadDetails(this.eventId);
				notifications.show({
					variant: "success",
					message: "Event published."
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				if (error.response && error.response.status === 422) {
					const errors = this.mapValidationErrorResponse(error.response.data);

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
	}

	unPublishEvent(id) {
		Bigneon()
			.events.unpublish({ id })
			.then(response => {
				this.setState({ isSubmitting: false });
				eventUpdateStore.loadDetails(this.eventId);
				notifications.show({
					variant: "success",
					message: "Event updated."
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.showFromErrorResponse({
					defaultMessage: "Failed to unpublish event.",
					error
				});
			});
	}

	renderDraftOptions() {
		const { errors } = this.state;
		const { classes } = this.props;
		const { event } = eventUpdateStore;
		const hasPublishDate = !!event.publishDate;

		return (
			<div>
				<FormSubHeading>Publish options</FormSubHeading>

				<div className={classes.ticketOptions}>
					<RadioButton
						active={!hasPublishDate}
						onClick={() =>
							eventUpdateStore.updateEvent({
								publishDate: null
							})
						}
					>
						Immediately
					</RadioButton>
					<RadioButton
						active={hasPublishDate}
						onClick={() =>
							eventUpdateStore.updateEvent({
								publishDate: moment()
							})
						}
					>
						Future date
					</RadioButton>
				</div>

				{hasPublishDate ? (
					<div className={classes.publishDateContainer}>
						<DateTimePickerGroup
							type="date"
							error={errors.publishDate}
							value={event.publishDate}
							name="eventDate"
							label="Publish date"
							onChange={publishDate => {
								const publishTime = moment(event.publishDate);
								publishDate.set({
									hour: publishTime.get("hour"),
									minute: publishTime.get("minute"),
									second: publishTime.get("second")
								});

								eventUpdateStore.updateEvent({
									publishDate
								});
							}}
							onBlur={this.validateFields.bind(this)}
						/>
						<span style={{ marginRight: 10, marginLeft: 10 }}/>
						<DateTimePickerGroup
							type="time"
							error={errors.publishDate}
							value={event.publishDate}
							name="eventTime"
							label="Publish time"
							onChange={publishTime => {
								const publishDate = moment(event.publishDate);

								publishDate.set({
									hour: publishTime.get("hour"),
									minute: publishTime.get("minute"),
									second: publishTime.get("second")
								});

								eventUpdateStore.updateEvent({
									publishDate
								});
							}}
							onBlur={this.validateFields.bind(this)}
						/>
					</div>
				) : null}
			</div>
		);
	}

	renderPublishedOptions() {
		const { errors } = this.state;
		const { classes } = this.props;
		const { event } = eventUpdateStore;
		const hasPublishDate = !!event.publishDate;
		const shouldUnpublish = !!event.shouldUnpublish;

		return (
			<div>
				<FormSubHeading>Publish options</FormSubHeading>

				<div className={classes.ticketOptions}>
					<RadioButton
						active={!shouldUnpublish}
						onClick={() =>
							eventUpdateStore.updateEvent({
								shouldUnpublish: false
							})
						}
					>
						Published
					</RadioButton>
					<RadioButton
						active={shouldUnpublish}
						onClick={() =>
							eventUpdateStore.updateEvent({
								shouldUnpublish: true
							})
						}
					>
						Unpublish
					</RadioButton>
				</div>

				{!shouldUnpublish ? (
					<Typography className={classes.publishedAt}>
						Published at{" "}
						{moment(event.publishDate).format("MM/DD/YYYY hh:mm A z")}
					</Typography>
				) : null}
			</div>
		);
	}

	render() {
		const { errors, isSubmitting, ticketTimesDirty, showImportPreviousEventDialog } = this.state;

		const { id, event, artists } = eventUpdateStore;
		const { status, isExternal, externalTicketsUrl, showCoverImage, eventDate } = event;

		const eventErrors = errors.event || {};
		const { classes } = this.props;

		const isDraft = status === "Draft";
		const isPublished = status === "Published";

		return (
			<div>
				{user.currentOrganizationId ? (
					<ImportPreviousEventDialog
						organizationId={user.currentOrganizationId}
						open={showImportPreviousEventDialog}
						onClose={() => this.setState({ showImportPreviousEventDialog: false })}
					/>
				) : null}

				<PageHeading iconUrl="/icons/events-multi.svg">
					{event ? "Update" : "Create"} event
				</PageHeading>
				<Card variant="form" className={classes.paper}>
					<PromoImage
						src={event.promoImageUrl}
						alt="Event promo image"
						caption="Recommended image size 2160px x 1080px"
						onUrlUpdate={promoImageUrl => {
							eventUpdateStore.updateEvent({ promoImageUrl });
						}}
						showCoverImage={showCoverImage}
						onChangeCoverImage={() => eventUpdateStore.updateEvent({ showCoverImage: !showCoverImage })}
						noMediaTitle="Upload event image"
					/>

					<div className={classes.paddedContent}>
						<FormSubHeading>Artists</FormSubHeading>
					</div>

					{artists !== null ? (
						<Artists artists={artists} errors={errors.artistsErrors || {}}/>
					) : null}

					<div className={classes.spacer}/>

					<div className={classes.paddedContent}>
						<FormSubHeading>Event details</FormSubHeading>

						<EventDetails
							validateFields={this.validateFields.bind(this)}
							errors={errors.event || {}}
						/>

						<div className={classes.spacer}/>
					</div>

					<div className={classes.paddedContent}>
						<FormSubHeading>Ticketing</FormSubHeading>

						<div className={classes.ticketOptions}>
							<RadioButton
								active={!isExternal}
								onClick={() =>
									eventUpdateStore.updateEvent({ isExternal: false })
								}
							>
								Big Neon
							</RadioButton>
							<RadioButton
								active={!!isExternal}
								onClick={() =>
									eventUpdateStore.updateEvent({ isExternal: true })
								}
							>
								External event
							</RadioButton>
						</div>
					</div>

					{isExternal ? (
						<div className={classes.paddedContent}>
							<InputGroup
								error={eventErrors.externalTicketsUrl}
								value={externalTicketsUrl}
								name="externalTicketsUrl"
								label="Link to purchase tickets externally"
								type="text"
								onChange={e =>
									eventUpdateStore.updateEvent({
										externalTicketsUrl: e.target.value
									})
								}
								placeholder="https://my-tix.com/event"
							/>
						</div>
					) : (
						<div style={{ marginTop: 30 }}>
							<Tickets
								errors={errors.ticketTypes}
								onChangeDate={() => {
									this.setState({ ticketTimesDirty: true });
								}}
								validateFields={this.validateFields.bind(this)}
								eventStartDate={eventDate}
								ticketTimesDirty={ticketTimesDirty}
							/>
						</div>
					)}

					<div className={classes.paddedContent}>
						<div className={classes.spacer}/>

						{isDraft ? this.renderDraftOptions() : null}
						{isPublished ? this.renderPublishedOptions() : null}

						<Divider style={{ marginTop: 20, marginBottom: 40 }}/>

						<div className={classes.actions}>
							{isDraft ? (
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
							) : (
								""
							)}

							<div style={{ width: "45%" }}>
								<Button
									disabled={isSubmitting}
									onClick={this.onUpdate.bind(this)}
									size="large"
									fullWidth
									variant="callToAction"
								>
									{isDraft ? "Publish" : "Update"}
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
