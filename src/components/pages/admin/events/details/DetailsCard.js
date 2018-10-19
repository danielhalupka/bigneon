import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles, Grid, InputLabel, CardMedia } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";

import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../../common/form/SelectGroup";
import FormSubHeading from "../../../../common/FormSubHeading";
import cloudinaryWidget from "../../../../../helpers/cloudinaryWidget";
import Bigneon from "../../../../../helpers/bigneon";

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

		const { eventDetails, organizationName } = props;

		const {
			age_limit,
			door_time,
			event_start,
			name,
			promo_image_url,
			venue_id,
			organization_id,
			additional_info,
			top_line_info
		} = eventDetails;

		this.state = {
			organizations: null,
			venues: null,

			name: name || "",
			eventDate: event_start
				? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				: null,
			doorTime: door_time
				? moment.utc(door_time, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				: null,
			ageLimit: age_limit || "",
			venueId: venue_id || "",
			additionalInfo: additional_info || "",
			topLineInfo: top_line_info
				? top_line_info
				: `${organizationName} presents`,
			promoImageUrl: promo_image_url,

			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { organizationId } = this.props;

		this.loadVenues(organizationId);
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const errors = {};

		const {
			name,
			eventDate,
			venueId,
			artists,
			doorTime,
			ageLimit,
			additionalInfo,
			topLineInfo,
			promoImageUrl
		} = this.state;

		if (!name) {
			errors.name = "Event name required.";
		}

		if (topLineInfo) {
			if (topLineInfo.length > 100) {
				errors.topLineInfo = "Top line info is limited to 100 characters.";
			}
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	createNewEvent(params, onSuccess) {
		Bigneon()
			.events.create(params)
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
		Bigneon()
			.events.update({ ...params, id })
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

		const { organizationId, eventId, onNext } = this.props;

		const {
			name,
			eventDate,
			venueId,
			artists,
			doorTime,
			ageLimit,
			additionalInfo,
			topLineInfo,
			promoImageUrl
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
			top_line_info: topLineInfo,
			promo_image_url: promoImageUrl
		};

		//If we're updating an existing venue
		if (eventId) {
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
			this.props.history.push(`/admin/events/${id}`);

			notifications.show({
				message: "New event created.",
				variant: "success"
			});

			onNext();
		});
	}

	loadVenues(organizationId) {
		this.setState({ venues: null }, () => {
			Bigneon()
				.venues.index()
				.then(response => {
					const { data, paging } = response.data; //@TODO Implement pagination
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

	uploadWidget() {
		cloudinaryWidget(
			result => {
				const imgResult = result[0];
				const { secure_url } = imgResult;
				console.log(secure_url);
				this.setState({ promoImageUrl: secure_url });
			},
			error => {
				console.error(error);

				notifications.show({
					message: "Image failed to upload.",
					variant: "error"
				});
			},
			["event-promo-images"]
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
			topLineInfo,
			promoImageUrl,
			isSubmitting,
			errors
		} = this.state;

		const { classes } = this.props;

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

							<Grid item xs={12} sm={12} lg={6}>
								<InputGroup
									error={errors.topLineInfo}
									value={topLineInfo}
									name="topLineInfo"
									label="Top line info"
									type="text"
									onChange={e => this.setState({ topLineInfo: e.target.value })}
									onBlur={this.validateFields.bind(this)}
									multiline
								/>
							</Grid>
						</Grid>

						<Grid container spacing={24}>
							<Grid item xs={12} sm={6} lg={6}>
								<div style={{ marginTop: 20, marginBottom: 10 }}>
									<InputLabel>Event promo image</InputLabel>
								</div>

								{promoImageUrl ? (
									<CardMedia
										className={classes.promoImage}
										image={promoImageUrl}
										title={"Event promo image"}
									/>
								) : null}

								<Button
									style={{ width: "100%" }}
									onClick={this.uploadWidget.bind(this)}
								>
									Upload image
								</Button>
							</Grid>
						</Grid>
					</CardContent>
					<CardActions>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							variant="callToAction"
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
	organizationId: PropTypes.string.isRequired,
	organizationName: PropTypes.string.isRequired,
	onNext: PropTypes.func.isRequired,
	eventDetails: PropTypes.object,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(DetailsCard);
