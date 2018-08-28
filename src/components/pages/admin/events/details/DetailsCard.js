import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Typography,
	withStyles,
	Grid,
	InputLabel,
	CardMedia
} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";

import Button from "../../../../common/Button";
import api from "../../../../../helpers/api";
import notifications from "../../../../../stores/notifications";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../../common/form/SelectGroup";
import FormSubHeading from "../../../../common/FormSubHeading";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	promoImage: {
		width: "100%",
		height: 300,
		borderRadius: theme.shape.borderRadius
	}
});

class DetailsCard extends Component {
	constructor(props) {
		super(props);

		const { eventDetails } = props;

		const {
			age_limit,
			door_time,
			event_start,
			name,
			promo_image_url,
			venue_id,
			organization_id,
			additional_info
		} = eventDetails;

		this.state = {
			organizations: null,
			venues: null,

			name: name || "",
			eventDate: event_start
				? moment(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				: null,
			doorTime: door_time
				? moment(door_time, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				: null,
			ageLimit: age_limit || "",
			venueId: venue_id || "",
			organizationId: organization_id || "",
			additionalInfo: additional_info || "",

			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const organization_id = null; //TODO get this from props if exists
		this.loadVenues(organization_id);

		api()
			.get("/organizations")
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
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

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const errors = {};
		//TODO validation

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	createNewEvent(params, onSuccess) {
		api()
			.post("/events", params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Create event failed.",
					variant: "error"
				});
			});
	}

	updateEvent(id, params, onSuccess) {
		console.log(params);
		api()
			.put(`/events/${id}`, { ...params, id })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Update event failed.",
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

		this.setState({ isSubmitting: true });

		const {
			name,
			eventDate,
			organizationId,
			venueId,
			artists,
			doorTime,
			ageLimit,
			additionalInfo,
			tickets
		} = this.state;

		const eventDetails = {
			name,
			venue_id: venueId,
			event_start: moment
				.utc(eventDate)
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS), //This format --> "2018-09-18T23:56:04"
			organization_id: organizationId,
			artists,
			door_time: moment
				.utc(doorTime)
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
			age_limit: Number(ageLimit),
			publish_date: moment
				.utc(new Date())
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS), //TODO make publish date selectable on in a date field
			additional_info: additionalInfo,
			tickets
		};

		console.log(eventDetails);

		//If we're updating an existing venue
		const { eventId, onNext } = this.props;
		if (eventId) {
			console.log(eventId);
			this.updateEvent(eventId, eventDetails, id => {
				notifications.show({
					message: "Event details updated.",
					variant: "success"
				});

				onNext();
			});

			return;
		}

		this.createNewEvent(eventDetails, id => {
			this.props.history.push(
				`/admin/events/f250cbfc-6159-4be4-b4d2-9e569201e4c9`
			);

			notifications.show({
				message: "New event created.",
				variant: "success"
			});

			onNext();
		});
	}

	loadVenues(organizationId) {
		this.setState({ venues: null }, () => {
			//TODO use the org id once an admin can assign a venue to an org
			//TODO use `/venues/organizations/${organizationId}`
			api()
				.get(`/venues`)
				.then(response => {
					const { data } = response;
					this.setState({ venues: data });
				})
				.catch(error => {
					console.error(error);

					let message = "Loading venues failed.";
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
		});
	}

	renderOrganizations() {
		const { organizationId, organizations, errors } = this.state;
		if (organizations === null) {
			return <Typography variant="body1">Loading organizations...</Typography>;
		}

		const organizationsObj = {};

		organizations.forEach(organization => {
			organizationsObj[organization.id] = organization.name;
		});

		return (
			<SelectGroup
				value={organizationId}
				items={organizationsObj}
				error={errors.organizationId}
				name={"organization"}
				label={"Organization"}
				onChange={e => {
					const organizationId = e.target.value;
					this.setState({ organizationId });
					//Reload venues belonging to this org
					this.loadVenues(organizationId);
				}}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	renderVenues() {
		const { venueId, venues, errors } = this.state;

		const venuesObj = {};

		let label = "";

		if (venues !== null) {
			venues.forEach(venue => {
				venuesObj[venue.id] = venue.name;
			});
			label = "Venue";
		} else {
			label = "Loading venues...";
		}

		return (
			<SelectGroup
				value={venueId}
				items={venuesObj}
				error={errors.venueId}
				name={"venues"}
				missingItemsLabel={"No available venues"}
				label={label}
				onChange={e => {
					const venueId = e.target.value;
					this.setState({ venueId });
				}}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	render() {
		const {
			name,
			eventDate,
			doorTime,
			ageLimit,
			additionalInfo,
			isSubmitting,
			errors
		} = this.state;

		const { classes, eventId } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<FormSubHeading>Event details</FormSubHeading>

						<Grid container spacing={24}>
							<Grid item xs={12} sm={12} lg={6}>
								<InputGroup
									error={errors.name}
									value={name}
									name="name"
									label="Event name"
									type="text"
									onChange={e => this.setState({ name: e.target.value })}
									onBlur={this.validateFields.bind(this)}
								/>
							</Grid>

							<Grid item xs={12} sm={12} lg={6}>
								{this.renderVenues()}
							</Grid>

							<Grid item xs={12} sm={12} lg={6}>
								<DateTimePickerGroup
									error={errors.eventDate}
									value={eventDate}
									name="eventDate"
									label="Event date"
									onChange={eventDate => {
										this.setState({ eventDate });
										//TODO add this check back when possible to change the end date of a ticket if it's later than the event date
										//const tickets = this.state.tickets;
										// if (tickets.length > 0) {
										// 	if (!tickets[0].endDate) {
										// 		tickets[0].endDate = eventDate;
										// 		this.setState({ tickets });
										// 	}
										// }
									}}
									onBlur={this.validateFields.bind(this)}
								/>
							</Grid>

							<Grid item xs={12} sm={12} lg={6}>
								<DateTimePickerGroup
									error={errors.doorTime}
									value={doorTime}
									name="doorTime"
									label="Door time"
									onChange={doorTime => this.setState({ doorTime })}
									onBlur={this.validateFields.bind(this)}
									format="HH:mm"
									type="time"
								/>
							</Grid>

							<Grid item xs={12} sm={12} lg={6}>
								<InputGroup
									error={errors.ageLimit}
									value={ageLimit}
									name="ageLimit"
									label="Age limit"
									type="number"
									onChange={e => this.setState({ ageLimit: e.target.value })}
									onBlur={this.validateFields.bind(this)}
								/>
							</Grid>

							<Grid item xs={12} sm={12} lg={6}>
								<InputGroup
									error={errors.additionalInfo}
									value={additionalInfo}
									name="additionalInfo"
									label="Additional info"
									type="text"
									onChange={e =>
										this.setState({ additionalInfo: e.target.value })
									}
									onBlur={this.validateFields.bind(this)}
									multiline
								/>
							</Grid>

							<Grid item xs={12} sm={6} lg={6}>
								<div style={{ marginTop: 20, marginBottom: 10 }}>
									<InputLabel>Event promo image</InputLabel>
								</div>

								<CardMedia
									className={classes.promoImage}
									image="https://picsum.photos/800/400/?image=368"
									title={"Artist"}
								/>
							</Grid>

							{/* TODO remove this if you're an admin or if the OrgOwner only owns one organization. Then we assume the org ID */}
							<Grid item xs={12} sm={12} lg={6}>
								{!eventId ? this.renderOrganizations() : null}
							</Grid>
						</Grid>
					</CardContent>
					<CardActions>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Saving..." : "Save and continue"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

DetailsCard.propTypes = {
	eventId: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	eventDetails: PropTypes.object,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(DetailsCard);
