import { observable, computed, action } from "mobx";

import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import user from "./user";

const getEventFromId = (events, id) => {
	const eventDetails = events.find(e => e.id === id);
	if (eventDetails) {
		return eventDetails;
	} else {
		return false;
	}
};

class BoxOffice {
	@observable
	activeEventId = null;

	@observable
	availableEvents = [];

	@observable
	ticketTypes = null;

	@observable
	holds = null;

	@observable
	guests = null;

	@action
	refreshEvents() {
		const organization_id = user.currentOrganizationId;
		if (!organization_id) {
			this.timeout = setTimeout(() => this.refreshEvents(), 500);
			return;
		}

		Bigneon()
			.organizations.events.index({ organization_id })
			.then(response => {
				const { data, paging } = response.data;
				this.availableEvents = data;

				this.ticketTypes = null;
				this.loadCachedCurrentEvent();
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading events failed."
				});
			});
	}

	@action
	refreshEventTickets() {
		this.refreshTicketTypes();
		this.refreshHolds();
		this.refreshGuests();
	}

	@action
	refreshTicketTypes() {
		if (!this.activeEventId) {
			return;
		}

		Bigneon()
			.events.read({ id: this.activeEventId })
			.then(response => {
				const { ticket_types } = response.data;

				const ticketTypes = {};
				ticket_types.forEach(({ id, ...ticket_type }) => {
					ticketTypes[id] = ticket_type;
				});

				this.ticketTypes = ticketTypes;
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event ticket types failed."
				});
			});
	}

	@action
	refreshHolds() {
		if (!this.activeEventId) {
			return;
		}

		Bigneon()
			.events.holds.index({ event_id: this.activeEventId })
			.then(response => {
				const { data } = response.data;

				const holds = {};
				data.forEach(({ id, ...hold }) => {
					holds[id] = hold;
				});
				
				this.holds = holds;
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading ticket holds failed."
				});
			});
	}

	@action
	refreshGuests() {
		if (!this.activeEventId) {
			return;
		}

		Bigneon()
			.events.guests.index({ event_id: this.activeEventId, query: "" })
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				const guests = {};

				data.forEach(
					({
						user_id,
						email,
						first_name,
						last_name,
						phone,
						...ticketDetails
					}) => {
						if (!guests[user_id]) {
							guests[user_id] = {
								email,
								first_name,
								last_name,
								phone,
								tickets: [ticketDetails]
							};
						} else {
							guests[user_id].tickets = [
								...guests[user_id].tickets,
								ticketDetails
							];
						}
					}
				);

				this.guests = guests;
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading guests failed.",
					error
				});
			});
	}

	@action
	loadCachedCurrentEvent() {
		const cachedActiveEventId = localStorage.getItem("boxOfficeActiveEventId");
		const activeEvent = getEventFromId(
			this.availableEvents,
			cachedActiveEventId
		);

		let eventId = false;

		if (activeEvent) {
			eventId = cachedActiveEventId;
		} else if (this.availableEvents.length > 0) {
			//If it doesn't exist locally assume first event
			eventId = this.availableEvents[0].id;
		}

		if (eventId) {
			this.setActiveEventId(eventId);
		} else {
			this.resetEventTickets();
		}
	}

	@action
	resetEventTickets() {
		this.ticketTypes = null;
		this.holds = null;
		this.guests = null;
	}

	@action
	setActiveEventId(id, reloadPage = false) {
		this.activeEventId = id;

		this.refreshEventTickets();

		localStorage.setItem("boxOfficeActiveEventId", id);

		//If this is being called by the user selecting their event
		if (reloadPage) {
			document.location.reload(true);
		}
	}

	@computed
	get activeEventDetails() {
		return getEventFromId(this.availableEvents, this.activeEventId);
	}

	@computed
	get childHolds() {
		if (!this.holds) {
			return null;
		}

		//For box office guests we only want to show holds that have parent holds
		const childHolds = {};
		Object.keys(this.holds).forEach((id) => {
			if (this.holds[id].parent_hold_id) {
				childHolds[id] = this.holds[id];
			}
		});

		return childHolds;
	}
}

const boxOffice = new BoxOffice();

export default boxOffice;
