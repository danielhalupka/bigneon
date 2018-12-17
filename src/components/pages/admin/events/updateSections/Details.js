import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles, Grid, Collapse } from "@material-ui/core";
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
		externalTicketsUrl
	} = event;

	if (!name) {
		errors.name = "Event name required.";
	}

	if (isExternal && !externalTicketsUrl) {
		errors.externalTicketsUrl = "Invalid external url.";
	}

	if (!venueId) {
		errors.venueId = "Venue required."
	}

	if (topLineInfo) {
		if (topLineInfo.length > 100) {
			errors.topLineInfo = "Top line info is limited to 100 characters.";
		}
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
		redeemDate,
		ageLimit,
		additionalInfo,
		topLineInfo,
		promoImageUrl,
		externalTicketsUrl,
		override_status
	} = event;

	const eventDetails = {
		name,
		organization_id: organizationId,
		age_limit: Number(ageLimit),
		additional_info: additionalInfo,
		top_line_info: topLineInfo,
		is_external: externalTicketsUrl !== null,
		external_url: externalTicketsUrl,
		override_status
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

	if (
		eventDate &&
		doorTime &&
		moment(eventDate).isValid() &&
		moment(doorTime).isValid()
	) {
		let tmpDoorTime = moment(eventDate);
		tmpDoorTime.set({
			hour: doorTime.get("hour"),
			minute: doorTime.get("minute"),
			second: doorTime.get("second")
		});
		eventDetails.door_time = moment
			.utc(tmpDoorTime)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	}

	if (
		eventDate &&
		redeemDate &&
		moment(eventDate).isValid() &&
		moment(redeemDate).isValid()
	) {
		let tmpRedeemDate = moment(eventDate);
		tmpRedeemDate.set({
			hour: redeemDate.get("hour"),
			minute: redeemDate.get("minute"),
			second: redeemDate.get("second")
		});
		eventDetails.redeem_date = moment
			.utc(tmpRedeemDate)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
	}

	if (publishDate) {
		eventDetails.publish_date = moment
			.utc(publishDate)
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
		override_status = "",
		status = "Draft"
	} = event;

	const tomorrow = new Date();
	tomorrow.setDate(new Date().getDate() + 1);

	let eventDate = event_start
		? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: moment.utc(tomorrow);
	let noon = moment(eventDate).set({
		"hour": "12",
		"minute": "00",
		"second": "00"
	});
	let showTime = event_start
		? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: noon;
	let doorTime = door_time
		? moment.utc(door_time, moment.HTML5_FMT.DATETIME_LOCAL_MS)
		: noon;

	const eventDetails = {
		override_status, //TODO get from API
		name: name || "",
		eventDate,
		showTime,
		doorTime,
		redeemDate: redeem_date
			? moment.utc(redeem_date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
			: null,
		publishDate: publish_date
			? moment.utc(publish_date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
			: new Date(),
		ageLimit: age_limit || "",
		venueId: venue_id || "",
		additionalInfo: additional_info || "",
		topLineInfo: top_line_info ? top_line_info : "",
		videoUrl: video_url || "",
		showTopLineInfo: !!top_line_info,
		promoImageUrl: promo_image_url,
		isExternal: is_external,
		externalTicketsUrl: is_external && external_url ? external_url : null,
		status
	};

	return eventDetails;
};

@observer
class Details extends Component {
	constructor(props) {
		super(props);

		this.state = {
			venues: null
		};

		this.changeDetails = this.changeDetails.bind(this);
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
					this.changeDetails({ venueId });
				}}
			/>
		);
	}

	validateFields() {
		//TODO might be needed later, use the function at the top
	}

	renderStatus() {
		const { errors } = this.props;
		const { override_status } = eventUpdateStore.event;

		const statusesObj = { "": "Auto" };
		let eventOverrideStatusEnum = Bn.Enums ? Bn.Enums.EventOverrideStatus : {};
		let eventOverrideStatusString = Bn.Enums
			? Bn.Enums.EVENT_OVERRIDE_STATUS_STRING
			: {};
		for (let statusConst in eventOverrideStatusEnum) {
			let serverEnum = eventOverrideStatusEnum[statusConst];
			let displayString = eventOverrideStatusString[serverEnum];
			statusesObj[serverEnum] = displayString;
		}

		let label = "Event status";

		return (
			<SelectGroup
				value={override_status || ""}
				items={statusesObj}
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

		const ageLimits = {
			"0": "All Ages Allowed",
			"18": "18+ Allowed",
			"21": "21+ Allowed"
		};

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

	render() {
		const { errors = {}, validateFields } = this.props;

		const {
			name,
			eventDate,
			doorTime,
			showTime,
			ageLimit,
			additionalInfo,
			topLineInfo,
			videoUrl,
			showTopLineInfo,
			redeemDate
		} = eventUpdateStore.event;

		return (
			<Grid container spacing={8}>
				<Grid
					style={{ paddingBottom: 0, marginBottom: 0 }}
					item
					xs={12}
					sm={12}
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
					lg={6}
				>
					{this.renderVenues()}
				</Grid>

				<Grid
					style={{ paddingTop: 0, marginTop: 0 }}
					item
					xs={12}
					sm={12}
					lg={12}
				>
					<Collapse in={!showTopLineInfo}>
						<Button
							style={{ marginBottom: 20 }}
							variant="additional"
							onClick={() => this.changeDetails({ showTopLineInfo: true })}
						>
							Add additional top line info
						</Button>
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

				<Grid item xs={12} sm={12} lg={6}>
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

				<Grid item xs={12} sm={12} lg={3}>
					<DateTimePickerGroup
						error={errors.doorTime}
						value={doorTime}
						name="doorTime"
						label="Door time"
						onChange={doorTime => this.changeDetails({ doorTime })}
						onBlur={validateFields}
						format="HH:mm"
						type="time"
					/>
				</Grid>

				<Grid item xs={12} sm={12} lg={3}>
					<DateTimePickerGroup
						error={errors.showTime}
						value={showTime}
						name="showTime"
						label="Show time"
						onChange={showTime => this.changeDetails({ showTime })}
						onBlur={validateFields}
						format="HH:mm"
						type="time"
					/>
				</Grid>
				{/*<Grid item xs={12} sm={12} lg={3}>
						<DateTimePickerGroup
							error={errors.redeemDate}
							value={redeemDate}
							name="redeemDate"
							label="Redeem Time"
							onChange={redeemDate => this.changeDetails({ redeemDate })}
							onBlur={validateFields}
							format="HH:mm"
							type="time"
						/>
					</Grid>*/}

				<Grid item xs={12} sm={12} lg={6}>
					{this.renderAgeLimits()}
				</Grid>

				<Grid item xs={12} sm={12} lg={6}>
					{this.renderStatus()}
				</Grid>

				<Grid item xs={12} sm={12} lg={12}>
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

				<Grid item xs={12} sm={12} lg={12}>
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
