import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles, Grid, Collapse, Hidden } from "@material-ui/core";
import moment from "moment";

import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../../common/form/SelectGroup";
import Bigneon from "../../../../../helpers/bigneon";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import Bn from "bn-api-node";

const styles = theme => ({});

export const DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME = 24; //For lack of a better var name

const validateFields = event => {
	const errors = {};

	const {
		name,
		eventDate,
		venueId,
		doorTime,
		ageLimit,
		additionalInfo,
		topLineInfo,
		videoUrl,
		isExternal,
		externalTicketsUrl,
		eventType
	} = event;

	if (!name) {
		errors.name = "Event name required.";
	}

	if (isExternal && !externalTicketsUrl) {
		errors.externalTicketsUrl = "Invalid external url.";
	}

	if (!venueId) {
		errors.venueId = "Venue required.";
	}

	if (topLineInfo) {
		if (topLineInfo.length > 100) {
			errors.topLineInfo = "Top line info is limited to 100 characters.";
		}
	}

	if (!eventType) {
		errors.eventType = "Invalid Event Type";
	}

	//TODO validate all fields

	if (Object.keys(errors).length > 0) {
		return errors;
	}

	return null;
};

const formatDataForSaving = (event, organizationId) => {
	const {
		name,
		eventDate,
		publishDate,
		venueId,
		doorTime,
		showTime,
		doorTimeHours,
		ageLimit,
		additionalInfo,
		topLineInfo,
		promoImageUrl,
		isExternal,
		externalTicketsUrl,
		override_status,
		videoUrl,
		endTime,
		eventType = "Music"
	} = event;

	const eventDetails = {
		name,
		organization_id: organizationId,
		age_limit: Number(ageLimit),
		additional_info: additionalInfo,
		top_line_info: topLineInfo,
		is_external: isExternal,
		external_url: externalTicketsUrl,
		override_status,
		video_url: videoUrl,
		event_type: eventType
	};

	if (
		eventDate &&
		showTime &&
		moment(eventDate).isValid() &&
		moment(showTime).isValid()
	) {
		//eventDate = eventDate + show time and door time need evenData added to them
		eventDate.set({
			hour: showTime.get("hour"),
			minute: showTime.get("minute"),
			second: showTime.get("second")
		});

		eventDetails.event_start = moment
			.utc(eventDate)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	}

	if (eventDate && moment(eventDate).isValid()) {
		// Set doorTime from showTime and doorTimeHours
		const tmpDoorTime = moment(eventDate).subtract(doorTimeHours, "h");
		eventDetails.door_time = moment
			.utc(tmpDoorTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		// Set redeemDate from doorTime
		eventDetails.redeem_date = eventDetails.door_time;
	}

	if (publishDate) {
		eventDetails.publish_date = moment
			.utc(publishDate)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	} else if (publishDate === null) {
		eventDetails.publish_date = null;
	}

	if (endTime) {
		eventDetails.event_end = moment
			.utc(endTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	} else {
		//Set default if not set
		const overrideEndTime = moment(eventDate).add(DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME, "h");
		eventDetails.event_end = moment
			.utc(overrideEndTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	}

	if (promoImageUrl) {
		eventDetails.promo_image_url = promoImageUrl;
	}

	if (venueId) {
		eventDetails.venue_id = venueId;
	}

	return eventDetails;
};

const formatDataForInputs = event => {
	const {
		age_limit,
		door_time,
		event_start,
		name,
		venue_id,
		organization_id,
		additional_info,
		top_line_info,
		video_url,
		promo_image_url,
		is_external,
		external_url,
		publish_date,
		redeem_date,
		event_end,
		override_status = "",
		status = "Draft",
		event_type = "Music"
	} = event;

	const tomorrow = new Date();
	tomorrow.setDate(new Date().getDate() + 1);

	const eventDate = event_start
		? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		: moment.utc(tomorrow).local();
	const noon = moment(eventDate).set({
		hour: "12",
		minute: "00",
		second: "00"
	});
	const showTime = event_start
		? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		: noon;
	const doorTime = door_time
		? moment.utc(door_time, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		: noon;
	const redeemDate = redeem_date
		? moment.utc(redeem_date, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		: noon;
	const doorTimeHours = door_time
		? moment.utc(event_start).diff(moment.utc(door_time), "m") / 60
		: 1; // Default: 1 hour
	const publishDate = publish_date
		? moment.utc(publish_date, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		: null;
	const endTime = event_end
		? moment.utc(event_end, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		: null;

	const eventDetails = {
		override_status, //TODO get from API
		name: name || "",
		eventDate,
		showTime,
		doorTime,
		endTime,
		doorTimeHours,
		publishDate,
		redeemDate,
		ageLimit: age_limit || "",
		venueId: venue_id || "",
		additionalInfo: additional_info || "",
		topLineInfo: top_line_info ? top_line_info : "",
		videoUrl: video_url || "",
		showTopLineInfo: !!top_line_info,
		promoImageUrl: promo_image_url,
		isExternal: is_external,
		externalTicketsUrl: is_external && external_url ? external_url : null,
		status,
		eventType: event_type
	};

	return eventDetails;
};

@observer
class Details extends Component {
	static doorHoursOptions = Array.from(Array(10 + 2)).map((_, i) => {
		if (i === 0) {
			return { value: 0, label: "Same as showtime" };
		}
		if (i === 1) {
			return { value: 0.5, label: "30 minutes before showtime" };
		}
		return {
			value: i - 1,
			label: i - 1 === 1 ? "1 hour before showtime" : `${i - 1} hours before showtime`
		};
	});

	constructor(props) {
		super(props);

		this.state = {
			venues: null
		};

		this.changeDetails = this.changeDetails.bind(this);
		this.handleDoorTimeChange = this.handleDoorTimeChange.bind(this);
	}

	changeDetails(details) {
		eventUpdateStore.updateEvent(details);
	}

	componentDidMount() {
		this.loadVenues();
	}

	loadVenues() {
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

	renderVenues() {
		const { venues } = this.state;
		const { errors } = this.props;

		const { venueId } = eventUpdateStore.event;

		const venueOptions = [];

		let label = "";

		if (venues !== null) {
			venues.forEach(venue => {
				venueOptions.push({ value: venue.id, label: venue.name });
			});
			label = "Venue";
		} else {
			label = "Loading venues...";
		}

		return (
			<SelectGroup
				value={venueId}
				items={venueOptions}
				error={errors.venueId}
				name={"venues"}
				missingItemsLabel={"No available venues"}
				label={label}
				onChange={e => {
					const venueId = e.target.value;
					this.changeDetails({ venueId });
				}}
			/>
		);
	}

	renderStatus() {
		const { errors } = this.props;
		const { override_status } = eventUpdateStore.event;

		const statusOptions = [{ value: false, label: "Auto" }];
		const eventOverrideStatusEnum = Bn.Enums ? Bn.Enums.EventOverrideStatus : {};
		const eventOverrideStatusString = Bn.Enums
			? Bn.Enums.EVENT_OVERRIDE_STATUS_STRING
			: {};
		for (const statusConst in eventOverrideStatusEnum) {
			const serverEnum = eventOverrideStatusEnum[statusConst];
			const displayString = eventOverrideStatusString[serverEnum];
			statusOptions.push({ value: serverEnum, label: displayString });
		}

		const label = "Event status";
		const overrideStatus = override_status || false;

		return (
			<SelectGroup
				value={overrideStatus}
				items={statusOptions}
				error={errors.status}
				name={"status"}
				label={label}
				onChange={e => {
					const override_status = e.target.value;
					this.changeDetails({ override_status });
				}}
			/>
		);
	}

	renderAgeLimits() {
		const { errors = {}, validateFields } = this.props;
		let { ageLimit } = eventUpdateStore.event;
		ageLimit = (ageLimit || "0") + "";

		const ageLimits = [
			{ value: "0", label: "This event is all ages" },
			{ value: "21", label: "This event is 21 and over" },
			{ value: "18", label: "This event is 18 and over" }
		];

		return (
			<SelectGroup
				value={ageLimit}
				items={ageLimits}
				error={errors.ageLimit}
				name={"age-limit"}
				label={"Age Limit"}
				onChange={e => {
					const ageLimit = e.target.value;
					this.changeDetails({ ageLimit });
				}}
				onBlur={validateFields}
			/>
		);
	}

	renderEventTypes() {
		const { errors = {}, validateFields } = this.props;
		let { eventType } = eventUpdateStore.event;
		eventType = eventType || "Music";

		const eventTypes = [
			{ value: "Music", label: "Music" },
			{ value: "Conference", label: "Conference" }
		];

		return (
			<SelectGroup
				value={eventType}
				items={eventTypes}
				error={errors.eventType}
				name={"event-types"}
				label={"Event Type"}
				onChange={e => {
					const eventType = e.target.value;
					this.changeDetails({ eventType });
				}}
				onBlur={validateFields}
			/>
		);
	}

	handleDoorTimeChange(e) {
		const doorTimeHours = e.target.value;
		this.changeDetails({ doorTimeHours });
	}

	render() {
		const { errors = {}, validateFields } = this.props;

		const {
			name,
			eventDate,
			showTime,
			endTime,
			additionalInfo,
			topLineInfo,
			videoUrl,
			showTopLineInfo,
			doorTimeHours = "1",
			eventType
		} = eventUpdateStore.event;

		//If a user hasn't adjusted the event start time yet
		//display the event end time to what will be assumed on saving the event
		let displayEndTime = null;
		if (endTime) {
			displayEndTime = endTime;
		} else if (showTime) {
			displayEndTime = moment(showTime).add(
				DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
				"hours"
			);
		}

		return (
			<Grid container spacing={8}>
				<Grid
					style={{ paddingBottom: 0, marginBottom: 0 }}
					item
					xs={12}
					sm={12}
					md={6}
					lg={6}
				>
					<InputGroup
						error={errors.name}
						value={name}
						name="eventName"
						label="Event name"
						placeholder="eg. Child's play"
						type="text"
						onChange={e => this.changeDetails({ name: e.target.value })}
						onBlur={validateFields}
					/>
				</Grid>

				<Grid
					style={{ paddingBottom: 0, marginBottom: 0 }}
					item
					xs={12}
					sm={12}
					md={6}
					lg={6}
				>
					{this.renderVenues()}
				</Grid>

				<Grid
					style={{ paddingBottom: 0, marginBottom: 0 }}
					item
					xs={12}
					sm={12}
					md={6}
					lg={6}
				>
					{this.renderEventTypes()}
				</Grid>

				<Grid
					style={{ paddingTop: 0, marginTop: 0 }}
					item
					xs={12}
					sm={12}
					md={12}
					lg={12}
				>
					<Collapse in={!showTopLineInfo}>
						<Hidden mdUp>
							<Button
								style={{ marginBottom: 20, width: "100%" }}
								variant="additional"
								onClick={() => this.changeDetails({ showTopLineInfo: true })}
							>
								Add additional top line info
							</Button>
						</Hidden>
						<Hidden smDown>
							<Button
								style={{ marginBottom: 20 }}
								variant="additional"
								onClick={() => this.changeDetails({ showTopLineInfo: true })}
							>
								Add additional top line info
							</Button>
						</Hidden>
					</Collapse>
					<Collapse in={showTopLineInfo}>
						<InputGroup
							error={errors.topLineInfo}
							value={topLineInfo}
							name="topLineInfo"
							label="Top line info"
							type="text"
							onChange={e =>
								this.changeDetails({ topLineInfo: e.target.value })
							}
							onBlur={validateFields}
							multiline
						/>
					</Collapse>
				</Grid>

				<Grid item xs={12} sm={12} md={6} lg={6}>
					<DateTimePickerGroup
						type="date"
						error={errors.eventDate}
						value={eventDate}
						name="eventDate"
						label="Event date"
						onChange={eventDate => {
							this.changeDetails({ eventDate });
							//TODO add this check back when possible to change the end date of a ticket if it's later than the event date
							//const tickets = this.state.tickets;
							// if (tickets.length > 0) {
							// 	if (!tickets[0].endDate) {
							// 		tickets[0].endDate = eventDate;
							// 		this.setState({ tickets });
							// 	}
							// }
						}}
						onBlur={validateFields}
					/>
				</Grid>

				<Grid item xs={12} sm={12} md={3} lg={3}>
					<DateTimePickerGroup
						error={errors.showTime}
						value={showTime}
						name="showTime"
						label="Showtime"
						onChange={showTime => this.changeDetails({ showTime })}
						onBlur={validateFields}
						format="HH:mm"
						type="time"
					/>
				</Grid>

				<Grid item xs={12} sm={12} md={3} lg={3}>
					<SelectGroup
						value={doorTimeHours}
						items={Details.doorHoursOptions}
						error={errors.doorTime}
						name="doorTimeHours"
						label="Door time"
						styleClassName="formControlNoMargin"
						onChange={this.handleDoorTimeChange}
					/>
				</Grid>

				<Grid item xs={12} sm={12} md={6} lg={6}>
					<DateTimePickerGroup
						type="date"
						error={errors.endTime}
						value={displayEndTime}
						name="endTime"
						label="Event end date"
						onChange={newEndDate => {
							const updatedEndTime = newEndDate;

							let adjustTime;

							//Adjust time part of newly selected date
							if (endTime) {
								adjustTime = endTime;
							} else if (showTime) {
								adjustTime = moment(showTime).add(
									DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
									"hours"
								);
							}

							if (adjustTime) {
								updatedEndTime.set({
									hour: adjustTime.get("hour"),
									minute: adjustTime.get("minute"),
									second: adjustTime.get("second")
								});
							}

							this.changeDetails({ endTime: updatedEndTime });
						}}
						onBlur={validateFields}
					/>
				</Grid>
				<Grid item xs={12} sm={12} md={6} lg={6}>
					<DateTimePickerGroup
						type="time"
						error={errors.endTime}
						value={displayEndTime}
						name="endTime"
						label="Event end time"
						onChange={newEndTime => {
							let updatedEndTime = moment();

							if (endTime) {
								updatedEndTime = moment(endTime);
							} else if (showTime) {
								updatedEndTime = moment(showTime).add(
									DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME,
									"hours"
								);
							}

							updatedEndTime.set({
								hour: newEndTime.get("hour"),
								minute: newEndTime.get("minute"),
								second: newEndTime.get("second")
							});

							this.changeDetails({ endTime: updatedEndTime });
						}}
						onBlur={validateFields}
					/>
				</Grid>

				<Grid item xs={12} sm={12} md={6} lg={6}>
					{this.renderAgeLimits()}
				</Grid>

				<Grid item xs={12} sm={12} md={6} lg={6}>
					{this.renderStatus()}
				</Grid>

				<Grid item xs={12} sm={12} md={12} lg={12}>
					<InputGroup
						error={errors.additionalInfo}
						value={additionalInfo}
						name="additionalInfo"
						label="Additional event info"
						type="text"
						onChange={e =>
							this.changeDetails({ additionalInfo: e.target.value })
						}
						onBlur={validateFields}
						placeholder="Enter any additional event info you require."
						multiline
					/>
				</Grid>

				<Grid item xs={12} sm={12} md={12} lg={12}>
					<InputGroup
						error={errors.videoUrl}
						value={videoUrl}
						name="videoUrl"
						label="Event video url"
						type="text"
						onChange={e => this.changeDetails({ videoUrl: e.target.value })}
						onBlur={validateFields}
						placeholder="https//vimeo.com/event-video-html"
					/>
				</Grid>
			</Grid>
		);
	}
}

Details.defaultProps = {
	errors: {}
};

Details.propTypes = {
	errors: PropTypes.object.isRequired,
	validateFields: PropTypes.func.isRequired
};

export const EventDetails = withStyles(styles)(Details);
export const validateEventFields = validateFields;
export const formatEventDataForSaving = formatDataForSaving;
export const formatEventDataForInputs = formatDataForInputs;
