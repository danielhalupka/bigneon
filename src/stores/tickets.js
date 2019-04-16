import { observable, computed, action } from "mobx";
import moment from "moment-timezone";

import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import user from "./user";

//TODO add filtering options to be used in display components

class Tickets {
	@observable
	upcomingGroups = null;

	@observable
	pastGroups = null;

	@action
	refreshTickets(type = "upcoming") {
		if (!user.isAuthenticated) {
			this.emptyTickets();
			return;
		}

		const params = {};

		const nowUTC = moment.utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		const longLongAgoUTC = moment
			.utc()
			.subtract(100, "y")
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

		if (type === "upcoming") {
			params.start_utc = nowUTC;
			params.dir = "Asc";
		} else if (type === "past") {
			//params.start_utc = longLongAgoUTC;
			params.end_utc = nowUTC;
			params.dir = "Desc";
		}

		Bigneon()
			.tickets.index(params)
			.then(response => {
				const { data, paging } = response.data; //TODO pagination
				const ticketGroups = [];

				//TODO api data structure will eventually change
				data.forEach(ticketGroup => {
					const event = ticketGroup[0];
					const tickets = ticketGroup[1];

					//TODO when the api returns the venue timezone, use that instead of the guess
					//https://github.com/big-neon/bn-api/issues/1091
					event.eventDate = moment(
						event.event_start,
						moment.HTML5_FMT.DATETIME_LOCAL_MS
					).tz(moment.tz.guess());

					event.formattedDate = event.eventDate.format("ddd MM/DD/YY, h:mm A");

					ticketGroups.push({ event, tickets });
				});

				if (type === "upcoming") {
					this.upcomingGroups = ticketGroups;
				} else if (type === "past") {
					this.pastGroups = ticketGroups;
				}
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading tickets failed."
				});
			});
	}

	@action
	emptyTickets() {
		this.upcomingGroups = [];
		this.pastGroups = [];
	}

	@computed
	get upcomingEventCount() {
		if (!this.upcomingGroups) {
			return 0;
		}

		return this.upcomingGroups.length;
	}
}

const tickets = new Tickets();

export default tickets;
