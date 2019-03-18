import { action, observable } from "mobx";
import { TicketCountReport } from "./ticketCountReport";
import React from "react";
import moment from "moment-timezone";

import Bigneon from "../../helpers/bigneon";
import notifications from "../notifications";

export class SettlementReport extends TicketCountReport {
	@observable
	eventDetails = {};

	@action
	fetchCountAndSalesData(queryParams, onSuccess) {
		super.fetchCountAndSalesData(queryParams, false, () => {
			onSuccess ? onSuccess() : null;
			this.loadEventDetails();
		});
	}

	async loadEventDetails() {
		const eventIds = [];
		const { counts } = this.countAndSalesData;
		if (counts) {
			counts.forEach((({ event_id }) => {
				if (eventIds.indexOf(event_id) < 0) {
					eventIds.push(event_id);
				}
			}));
		}

		for (let index = 0; index < eventIds.length; index++) {
			const id = eventIds[index];
			try {
				const result = await Bigneon().events.read({ id });
				if (result.data) {
					const { venue, ...event } = result.data;
					const { event_start } = event;

					this.setEventDetails(id, {
						venue: venue.name,
						displayStartDate: moment.utc(event_start).tz(venue.timezone).format("dddd, MMMM Do YYYY z")
					});
				}
			} catch(error) {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load event date and venue."
				});
			}

		}
	}

	setEventDetails(id, details = { displayStartDate: "", venue: "" }) {
		this.eventDetails[id] = details;
	}

}

const settlementReport = new SettlementReport();
export default settlementReport;