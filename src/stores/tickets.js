import { observable, computed, action } from "mobx";
import moment from "moment-timezone";

import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import user from "./user";

//TODO add filtering options to be used in display components

class Tickets {
	@observable
	groups = null;

	@action
	refreshTickets() {
		//Right now carts only work for authed users
		if (!user.isAuthenticated) {
			this.emptyTickets();
			return;
		}

		Bigneon()
			.tickets.index()
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

				this.groups = ticketGroups;
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading tickets failed."
				});
			});
	}

	emptyTickets() {
		this.groups = [];
	}

	@computed
	get ticketGroupCount() {
		//Ticket groups are tickets grouped by event
		if (!this.groups) {
			return 0;
		}

		return this.groups.length;
	}

	@computed
	get upcomingEventCount() {
		if (!this.groups) {
			return 0;
		}

		let upcomingCount = 0;
		this.groups.forEach(({ event }) => {
			const { event_start } = event;
			const eventStartDateUTC = (event.eventDate = moment.utc(
				event.event_start,
				moment.HTML5_FMT.DATETIME_LOCAL_MS
			));

			const timeDifference = moment.utc().diff(eventStartDateUTC);
			if (timeDifference < 0) {
				upcomingCount++;
			}
		});

		return upcomingCount;
	}
}

const tickets = new Tickets();

export default tickets;
