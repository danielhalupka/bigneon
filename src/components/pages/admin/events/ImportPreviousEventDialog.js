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
import CheckBox from "../../../elements/form/CheckBox";

const displayTime = ({ event_start }) => {
	const displayDate = moment(event_start).format("ddd, D MMM YYYY");
	const displayShowTime = moment(event_start).format("hh:mm A");

	return `${displayDate}, Show ${displayShowTime}`;
};

const styles = theme => {
	return ({
		root: {
			maxWidth: 500
		},
		eventIcon: {
			width: 80,
			height: 40,
			borderRadius: 4
		},
		buttonContainer: {
			display: "flex"
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
		}
	});
};

class ImportPreviousEventDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventsNames: {},
			events: [],
			selectedEventId: null,
			selectedImportOptions: {
				venue: { label: "Venue", active: true },
				eventType: { label: "Event type", active: true },
				showTime: { label: "Show time", active: true },
				doorTime: { label: "Door time", active: true },
				endTime: { label: "End time", active: true },
				ageLimit: { label: "Age limit", active: true }
			}
		};
	}

	componentDidMount() {
		const { organizationId } = this.props;
		
		Bigneon()
			.organizations.events.index({
				organization_id: organizationId
				//past_or_upcoming: "Past"
			})
			.then(eventResponse => {
				const eventsNames = {};
				eventResponse.data.data.forEach(({ id, name }) => {
					eventsNames[id] = name;
				});

				this.setState({ events: eventResponse.data.data, eventsNames });
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
		const { onClose } = this.props;
		const { selectedImportOptions, events, selectedEventId } = this.state;

		const previousEvent = events.find(e => e.id === selectedEventId);
		if (!previousEvent) {
			return;
		}

		console.log(previousEvent);

		const { venue, event_type, age_limit, localized_times } = previousEvent;
		const { event_start, door_time, event_end } = localized_times;

		const updateEventDetails = {};

		if (selectedImportOptions.venue.active) {
			updateEventDetails.venueId = venue.id;
		}

		if (selectedImportOptions.eventType.active) {
			updateEventDetails.eventType = event_type;
		}

		if (selectedImportOptions.showTime.active) {
			//TODO set time of eventDate obj
		}

		if (selectedImportOptions.doorTime.active) {
			const doorTimeHours = door_time
				? moment(event_start).diff(moment(door_time), "m") / 60
				: 1;
			updateEventDetails.doorTimeHours = doorTimeHours;
		}

		if (selectedImportOptions.endTime.active) {
			//TODO set time of eventDate obj
		}

		if (selectedImportOptions.ageLimit.active) {
			updateEventDetails.ageLimit = age_limit;
		}

		console.log(updateEventDetails);

		eventUpdateStore.updateEvent(updateEventDetails);
		onClose();
	}

	renderSelectOption(props) {
		const { classes } = this.props;
		const id = props.value;
		const { events } = this.state;

		const eventDetails = events.find(e => e.id === id);

		const { name, promo_image_url, localized_times, venue } = eventDetails;

		const icon = <img alt={name} className={classes.eventIcon} src={optimizedImageUrl(promo_image_url)}/>;

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
				<ListItemText inset primary={props.children} secondary={`${venue.name} - ${displayTime(localized_times)}`}/>
			</MenuItem>
		);
	}

	renderSelectedOption() {
		const { events, selectedEventId } = this.state;
		const { classes } = this.props;

		const eventDetails = events.find(e => e.id === selectedEventId);
		const { name, promo_image_url, localized_times, venue } = eventDetails;

		return (
			<div className={classes.selectedEventContainer}>
				<img alt={name} className={classes.eventIcon} src={optimizedImageUrl(promo_image_url)}/>
				<ListItemText inset primary={name} secondary={`${venue.name} - ${displayTime(localized_times)}`}/>
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

	renderImportCheckboxes() {
		const { selectedEventId, selectedImportOptions } = this.state;
		const { classes } = this.props;

		if (!selectedEventId) {
			return <div className={classes.checkboxContainer}/>;
		}

		return (
			<Grid container spacing={24} className={classes.checkboxContainer}>
				{Object.keys(selectedImportOptions).map((key) => {
					const { active, label } = selectedImportOptions[key];
					return (
						<Grid key={key} item xs={12} sm={6} lg={6}>
							<CheckBox
								active={active}
								onClick={() => {
									this.setState(({ selectedImportOptions }) => {
										selectedImportOptions[key].active = !active;
										return { selectedImportOptions };
									});
								}}
							>
								{label}
							</CheckBox>
						</Grid>
					);
				})}
			</Grid>
		);
	}

	render() {
		const {
			open,
			onClose,
			classes
		} = this.props;
		const { selectedEventId } = this.state;

		return (
			<Dialog
				open={open}
				onClose={onClose}
				iconUrl={"/icons/copy-white.svg"}
				title={"Import event settings"}
			>
				<div className={classes.root}>
					<Typography>
						Save time by importing event settings from a different event. This will import basic event information like Door Time, Show Time, End Time, Age Restrictions, and Venue. You can always make changes after importing.					</Typography>
					{this.renderPastEventsAutoComplete()}
					{this.renderImportCheckboxes()}

					<div className={classes.buttonContainer}>
						<Button
							style={{ flex: 1, marginRight: 5 }}
							onClick={onClose}
						>
							No thanks
						</Button>
						<Button
							disabled={!selectedEventId}
							style={{ flex: 1, marginLeft: 5 }}
							variant={"callToAction"}
							onClick={this.onImport.bind(this)}
						>
							Import settings
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
