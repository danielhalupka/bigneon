import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { ListItemIcon, ListItemText, MenuItem, Typography, Grid } from "@material-ui/core";
import moment from "moment-timezone";

import Dialog from "../../../elements/Dialog";
import AutoCompleteGroup from "../../../common/form/AutoCompleteGroup";
import Bigneon from "../../../../helpers/bigneon";
import notifications from "../../../../stores/notifications";
import optimizedImageUrl from "../../../../helpers/optimizedImageUrl";
import Button from "../../../elements/Button";
import eventUpdateStore from "../../../../stores/eventUpdate";
import { updateTimezonesInObjects } from "../../../../helpers/time";
import createGoogleMapsLink from "../../../../helpers/createGoogleMapsLink";
import Loader from "../../../elements/loaders/Loader";
import { fontFamilyDemiBold, textColorPrimary } from "../../../styles/theme";
import { DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME } from "./updateSections/Details";

const displayTime = (event_start, timezone) => {
	const displayDate = moment.utc(event_start).tz(timezone).format("ddd, D MMM YYYY");
	const displayShowTime = moment.utc(event_start).tz(timezone).format("hh:mm A");

	return `${displayDate}, Show ${displayShowTime}`;
};

const styles = theme => {
	return ({
		root: {
			maxWidth: 400
		},
		explainerContainer: {
			padding: theme.spacing.unit * 3
		},
		eventIcon: {
			width: 80,
			height: 40,
			borderRadius: 4
		},
		buttonContainer: {
			display: "flex",
			marginTop: 60
		},
		checkboxContainer: {
			minHeight: 100,
			paddingBottom: theme.spacing.unit * 2,
			[theme.breakpoints.up("md")]: {
				paddingLeft: "20%"
			}
		},
		selectedEventContainer: {
			flex: 1,
			display: "flex",
			alignItems: "center"
		},
		selectionOptionTextPrimary: {
			fontSize: theme.typography.fontSize * 0.95,
			color: textColorPrimary,
			fontFamily: fontFamilyDemiBold
		},
		selectionOptionTextSecondary: {
			fontSize: theme.typography.fontSize * 0.8,
			color: "#9DA3B4"
		}
	});
};

class ImportPreviousEventDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventsNames: {},
			events: null,
			selectedEventId: null,
			isImporting: false
		};
	}

	componentDidMount() {
		this.loadEvents("upcoming", () => this.loadEvents("past"));
	}

	loadEvents(past_or_upcoming, callback = () => {}) {
		const { organizationId } = this.props;

		Bigneon()
			.organizations.events.index({
				organization_id: organizationId,
				past_or_upcoming
			})
			.then(eventResponse => {
				const newEventsNames = {};
				eventResponse.data.data.forEach(({ id, name }) => {
					newEventsNames[id] = name;
				});

				this.setState(({ events, eventsNames }) => {
					let newEvents = [];
					if (events) {
						newEvents = [...events, ...eventResponse.data.data];
					} else {
						newEvents = eventResponse.data.data;
					}

					return { events: newEvents, eventsNames: { ...eventsNames, ...newEventsNames } };
				}, callback);
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading events failed.",
					error
				});
			});
	}

	onImport() {
		this.setState({ isImporting: true });

		const { onClose } = this.props;
		const { selectedEventId } = this.state;

		Bigneon()
			.events.read({ id: selectedEventId })
			.then(response => {
				const { event_start, event_end, event_type, door_time, age_limit, venue, ...event } = response.data;

				const previousEventDate = event_start
					? moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
						.set({
							second: 0,
							millisecond: 0
						})
					: undefined;

				const eventDate = moment.utc();

				//Event endTime = eventDate + (eventDate - previousEndTime)
				const endTime = previousEventDate.clone().add(DEFAULT_END_TIME_HOURS_AFTER_SHOW_TIME, "h"); //Default if one doesn't exist

				const previousEventEndTime = event_end ? moment.utc(event_end, moment.HTML5_FMT.DATETIME_LOCAL_MS) : null;

				let updateEventDetails = {
					venueId: venue.id,
					eventType: event_type,
					doorTimeHours: door_time
						? moment(event_start).diff(moment(door_time), "m") / 60
						: 1,
					ageLimit: age_limit,
					eventDate,
					endTime
				};

				updateEventDetails = { ...updateEventDetails, ...updateTimezonesInObjects(updateEventDetails, venue.timezone) };

				//Get the original hours & minutes from the previous event start time (In that timezone/DST)
				if (previousEventDate) {
					previousEventDate.tz(venue.timezone);
					updateEventDetails.eventDate.set({
						hour: previousEventDate.get("hour"),
						minute: previousEventDate.get("minute"),
						second: 0,
						millisecond: 0
					}).add("d", 2);

					if (previousEventEndTime) {
						const diff = previousEventEndTime.diff(previousEventDate);
						updateEventDetails.endTime = updateEventDetails.eventDate.clone().add(diff);
					}
				}

				eventUpdateStore.updateEvent(updateEventDetails);

				console.log(venue.timezone);
				console.log(updateEventDetails.eventDate.format("z"));
				onClose();

				this.setState({ isImporting: false });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	renderSelectOption(props) {
		const { classes } = this.props;
		const id = props.value;
		const { events } = this.state;

		const eventDetails = events.find(e => e.id === id);

		const { name, promo_image_url, event_start, venue } = eventDetails;

		const icon = <img alt={name} className={classes.eventIcon} src={promo_image_url ? optimizedImageUrl(promo_image_url) : ""}/>;

		return (
			<MenuItem
				buttonRef={props.innerRef}
				selected={props.isFocused}
				component="div"
				style={{
					paddingLeft: 0,
					fontWeight: props.isSelected ? 500 : 400
				}}
				{...props.innerProps}
			>
				{icon ?
					(
						<ListItemIcon>
							{icon}
						</ListItemIcon>
					)
					: null}
				<ListItemText
					classes={{
						primary: classes.selectionOptionTextPrimary,
						secondary: classes.selectionOptionTextSecondary
					}}
					inset
					primary={props.children}
					secondary={`${venue.name} - ${displayTime(event_start, venue.timezone)}`}
				/>
			</MenuItem>
		);
	}

	renderSelectedOption() {
		const { events, selectedEventId } = this.state;
		const { classes } = this.props;

		const eventDetails = events.find(e => e.id === selectedEventId);
		const { name, promo_image_url, event_start, venue } = eventDetails;

		return (
			<div className={classes.selectedEventContainer}>
				<img alt={name} className={classes.eventIcon} src={optimizedImageUrl(promo_image_url)}/>
				<ListItemText
					classes={{
						primary: classes.selectionOptionTextPrimary,
						secondary: classes.selectionOptionTextSecondary
					}}
					inset
					primary={name}
					secondary={`${venue.name} - ${displayTime(event_start, venue.timezone)}`}
				/>
			</div>
		);
	}

	renderPastEventsAutoComplete() {
		const { events, eventsNames, selectedEventId } = this.state;

		return (
			<AutoCompleteGroup
				value={events.find(e => e.id === selectedEventId)}
				items={eventsNames}
				name={"events"}
				placeholder={"Search by event name"}
				onChange={id => this.setState({ selectedEventId: id })}
				renderSelectOption={this.renderSelectOption.bind(this)}
				renderValueContainer={selectedEventId ? this.renderSelectedOption.bind(this) : null}
			/>
		);
	}

	render() {
		const {
			open,
			onClose,
			classes
		} = this.props;
		const { selectedEventId, isImporting, events } = this.state;

		return (
			<Dialog
				open={open}
				onClose={onClose}
				iconUrl={"/icons/copy-white.svg"}
				title={"Import event settings"}
			>
				<div className={classes.root}>
					<div className={classes.explainerContainer}>
						<Typography>
							Save time by importing event settings from a different event. This will import basic event information like Door Time, Show Time, End Time, Age Restrictions, and Venue. You can always make changes after importing.
						</Typography>
					</div>

					{events === null ? <Loader>Loading past events...</Loader> : this.renderPastEventsAutoComplete()}

					<div className={classes.buttonContainer}>
						<Button
							size={"large"}
							style={{ flex: 1, marginRight: 5 }}
							onClick={onClose}
						>
							No thanks
						</Button>
						<Button
							size={"large"}
							disabled={!selectedEventId || isImporting}
							style={{ flex: 1, marginLeft: 5 }}
							variant={"callToAction"}
							onClick={this.onImport.bind(this)}
						>
							{isImporting ? "Importing..." : "Import settings"}
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}
}

ImportPreviousEventDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(ImportPreviousEventDialog);
