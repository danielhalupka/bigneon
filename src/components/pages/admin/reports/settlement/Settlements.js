import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";

import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ReportsDate from "../ReportDate";
import Loader from "../../../../elements/loaders/Loader";
import Bigneon from "../../../../../helpers/bigneon";
import SingleEventSettlement from "./SingleEventSettlement";
import createGoogleMapsLink from "../../../../../helpers/createGoogleMapsLink";

const dateRangeString = (startDate, endDate) => (startDate && endDate) ? `from ${startDate.format("MMM DD, YYYY")} - ${endDate.format("MMM DD, YYYY")}` : "from all time";

const styles = theme => ({
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

class Settlements extends Component {
	constructor(props) {
		super(props);

		this.initialState = {
			events: []
		};

		this.state = this.initialState;
	}

	refreshData(dataParams = { start_utc: null, end_utc: null, startDate: null, endDate: null }) {
		const { startDate, endDate, start_utc, end_utc } = dataParams;

		this.setState({ ...this.initialState, startDate, endDate, events: null });

		const { organizationId } = this.props;
		const queryParams = { organization_id: organizationId, start_utc, end_utc };

		Bigneon()
			.reports.weeklySettlement(queryParams)
			.then(response => {
				const events = response.data;

				this.setState({ events }, this.setEventDetails.bind(this));
			})
			.catch(error => {
				console.log(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading settlement reports failed."
				});
			});
	}

	setEventDetails() {
		const { events } = this.state;

		events.forEach((event, index) => {
			this.setEventData(event.event_id, index);
		});
	}

	setEventData(id, index) {
		Bigneon()
			.events.read({ id })
			.then(response => {
				const { artists, organization, venue, ...event } = response.data;

				const {
					name,
					event_start
				} = event;

				const venueTimezone = venue.timezone || "America/Los_Angeles";

				const eventDetails = {
					name,
					eventStartDisplay: moment.utc(event_start)
						.tz(venueTimezone)
						.format("M/D/YYYY h:mmA z"),
					venueName: venue.name
				};

				this.setState(({ events }) => {
					events[index] = { ...events[index], ...eventDetails };
					return { events };
				});
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	exportCSV() {
		const {
			events
		} = this.state;

		if (!events) {
			return notifications.show({
				message: "No rows to export.",
				variant: "warning"
			});
		}

		const csvRows = [];

		const title = "Event settlement: ";

		csvRows.push([title]);

		downloadCSV(csvRows, "weekly-event-settlement-report");
	}

	renderResults() {
		const { events } = this.state;

		if (events === null) {
			return <Loader/>;
		}

		return (
			<div>
				{events.map((event, index) => <SingleEventSettlement key={index} {...event}/>)}
			</div>
		);
	}

	render() {
		return (
			<div>
				<div
					style={{
						display: "flex",
						minHeight: 60,
						alignItems: "center"
					}}
				>
					<Typography variant="title">Weekly event settlement</Typography>
					{/*<Typography className={classes.subHeading}>Sales occurring {dateRangeString(startDate, endDate)}</Typography>*/}

					<span style={{ flex: 1 }}/>
					<Button
						iconUrl="/icons/csv-active.svg"
						variant="text"
						onClick={this.exportCSV.bind(this)}
					>
						Export CSV
					</Button>
				</div>
				<div>
					<ReportsDate defaultStartDaysBack={7} onChange={this.refreshData.bind(this)} onChangeButton/>
				</div>

				{this.renderResults()}
			</div>
		);
	}
}

Settlements.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(Settlements);
