import { observable, computed, action } from "mobx";
import moment from "moment-timezone";

import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import user from "./user";

//TODO remove this when timezone is passed in API
//https://github.com/big-neon/bn-api/issues/1091
const momentFromLocalizedTime = (localized_time) => {
	const n = localized_time.indexOf("-");
	const dateString = localized_time.substring(0, n != -1 ? n : localized_time.length);
	return moment(dateString, "ddd,  D MMM YYYY hh:mm:ss");
};

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
					const { localized_times } = event;

					event.eventDate = momentFromLocalizedTime(localized_times.event_start);
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
			const { localized_times } = event;
			const eventStartDate = momentFromLocalizedTime(localized_times.event_start);
			const timeDifference = moment().diff(eventStartDate);
			if (timeDifference < 0) {
				upcomingCount++;
			}
		});

		return upcomingCount;
	}
}

const tickets = new Tickets();

export default tickets;
