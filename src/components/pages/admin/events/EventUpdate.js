import React, { Component } from "react";
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
import Tickets from "./updateSections/Tickets";

import FormSubHeading from "../../../elements/FormSubHeading";
import Button from "../../../elements/Button";
import RadioButton from "../../../elements/form/RadioButton";
import InputGroup from "../../../common/form/InputGroup";

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
			eventId: null,
			organizationId: null,
			organizations: null,
			artists: null,
			event: formatEventDataForInputs({}),
			organization: {},
			venue: null,
			errors: {},
			externalEvent: false,
			externalTicketsUrl: "",
			publishNow: true
		};

		this.onEventDetailsChange = this.onEventDetailsChange.bind(this);
	}

	componentDidMount() {
		this.loadEventDetails();
	}

	validateFields() {
		if (this.hasSubmitted) {
			const { event } = this.state;
			const eventDetailErrors = validateEventFields(event);
			if (eventDetailErrors) {
				console.log("Update error state");
				console.warn(eventDetailErrors);
				this.setState(({ errors }) => ({
					errors: { ...errors, event: eventDetailErrors }
				}));

				return false;
			} else {
				this.setState({ errors: {} });
				return true;
			}
		}

		return true;
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
				const { data, paging } = response.data; //@TODO Implement pagination
				const organizationSelectObj = {};
				data.forEach(organization => {
					organizationSelectObj[organization.id] = organization.name;
				});

				//If there's only org then assume that ID
				if (data.length === 1) {
					this.setState({ organizationId: data[0].id });
				}
				//FIXME remove this when not developing
				else if (process.env.NODE_ENV === "development") {
					this.setState({ organizationId: data[0].id });
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

	loadEventDetails() {
		const { eventId } = this.state;

		if (eventId) {
			Bigneon()
				.events.read({ id: eventId })
				.then(response => {
					const { artists, organization, venue, ...event } = response.data;
					const { organization_id } = event;
					this.setState({
						event: formatEventDataForInputs(event),
						artists: formatArtistsForInputs(artists),
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
			this.setState({ artists: [] });
			this.loadOrganizations();
		}
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
			notifications.show({ variant: "success", message: "Event published" });
		}

		this.setState({ isSubmitting: false });
	}

	async saveEventDetails() {
		this.hasSubmitted = true;

		const {
			eventId,
			artists,
			event,
			organization,
			venue,
			organizations,
			organizationSelectObj,
			organizationId
		} = this.state;

		if (!this.validateFields()) {
			return notifications.show({
				variant: "warning",
				message: "There are invalid event details."
			});
		}

		const formattedEventDetails = formatEventDataForSaving(
			event,
			organizationId
		);

		if (eventId) {
			const result = await updateEventDetails(eventId, formattedEventDetails);
			if (!result) {
				return false;
			}
		} else {
			const id = await createNewEvent(formattedEventDetails);
			if (!id) {
				return false;
			} else {
				this.props.history.push(`/admin/events/${id}/edit`);
			}
		}

		const formattedArtists = formatArtistsForSaving(artists);

		const result = updateArtistList(eventId, formattedArtists);
		if (!result) {
			return false;
		}

		//TODO save/update tickets

		return true;
	}

	onEventDetailsChange(updatedEvent) {
		this.setState(({ event }) => ({ event: { ...event, ...updatedEvent } }));
	}

	render() {
		const {
			artists,
			event,
			organization,
			venue,
			organizations,
			organizationSelectObj,
			organizationId,
			errors,
			externalEvent,
			externalTicketsUrl,
			eventId,
			publishNow
		} = this.state;
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
						this.setState({ organization });
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
							onUrlUpdate={promoImageUrl =>
								this.onEventDetailsChange({ promoImageUrl })
							}
							noMediaTitle="Upload event image"
						/>

						<div className={classes.paddedContent}>
							<FormSubHeading>Artists</FormSubHeading>
						</div>

						{artists !== null ? (
							<Artists
								onHeadlineArtistImageUrl={promoImageUrl => {
									if (!event.promoImageUrl) {
										//Assume the promo image is the headliner artist
										this.onEventDetailsChange({ promoImageUrl });
									}
								}}
								onArtistsChange={artists => this.setState({ artists })}
								organizationId={organizationId}
								artists={artists}
							/>
						) : null}

						<div className={classes.spacer} />

						<div className={classes.paddedContent}>
							<FormSubHeading>Event details</FormSubHeading>

							<EventDetails
								event={event}
								onEventDetailsChange={this.onEventDetailsChange}
								eventDetails={event}
								organizationId={organizationId}
								validateFields={this.validateFields.bind(this)}
								errors={errors.event}
							/>

							<div className={classes.spacer} />
						</div>

						<div className={classes.paddedContent}>
							<FormSubHeading>Ticketing</FormSubHeading>

							<div className={classes.ticketOptions}>
								<RadioButton
									active={!externalEvent}
									onClick={() => this.setState({ externalEvent: false })}
								>
									BigNeon
								</RadioButton>
								<RadioButton
									active={externalEvent}
									onClick={() => this.setState({ externalEvent: true })}
								>
									External event
								</RadioButton>
							</div>
						</div>

						{externalEvent ? (
							<div className={classes.paddedContent}>
								<InputGroup
									error={errors.videoUrl}
									value={externalTicketsUrl}
									name="externalTicketsUrl"
									label="Link to purchase tickets externally"
									type="text"
									onChange={e =>
										this.setState({ externalTicketsUrl: e.target.value })
									}
									placeholder="https//my-tix.com/event"
								/>
							</div>
						) : (
							<div style={{ marginTop: 30 }}>
								<Tickets
									validateFields={this.validateFields.bind(this)}
									eventId={eventId}
									eventStartDate={event.eventDate || new Date()} //FIXME this might cause problems later assuming the date
									organizationId={organizationId}
								/>
							</div>
						)}

						<div className={classes.paddedContent}>
							<div className={classes.spacer} />

							<FormSubHeading>Publish options</FormSubHeading>

							<div className={classes.ticketOptions}>
								<RadioButton
									active={publishNow}
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

							<Divider style={{ marginTop: 20, marginBottom: 40 }} />

							<div className={classes.actions}>
								<div style={{ width: "45%" }}>
									<Button
										onClick={this.onSaveDraft.bind(this)}
										size="large"
										fullWidth
									>
										Save draft
									</Button>
								</div>
								<div style={{ width: "45%" }}>
									<Button
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
