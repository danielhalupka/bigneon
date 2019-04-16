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
		this.refreshAccessCodeTicketTypes();
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

				this.refreshHolds();
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
	refreshAccessCodeTicketTypes() {
		if (!this.activeEventId) {
			return;
		}

		Bigneon()
			.events.codes.index({ event_id: this.activeEventId, type: "Access" })
			.then(response => {
				const { data } = response.data;
				const promises = [];
				//Use a local variable to store the changes until we are ready to replace the state variable
				const ticketTypes = {};
				data.forEach(code => {
					promises.push(
						Bigneon().redemptionCodes.read({
							code: code.redemption_codes[0],
							event_id: this.activeEventId
						})
					);
				});
				Promise.all(promises)
					.then(responses => {
						responses.forEach(response => {
							const { data } = response;
							if (data.ticket_types && data.ticket_types.length == 1) {
								const newTicketType = data.ticket_types[0];
								newTicketType.name +=
									" (Access Code: " + data.redemption_code + ")";
								ticketTypes[data.ticket_types[0].id] = newTicketType;
							}
						});
						this.ticketTypes = { ...this.ticketTypes, ...ticketTypes };
					})
					.catch(error => {
						console.error(error);
						notifications.showFromErrorResponse({
							error,
							defaultMessage: "Loading ticket code failed."
						});
					});
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading ticket access codes failed."
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
				const promises = [];
				data.forEach(({ id, ...hold }) => {
					holds[id] = hold;
					//Check if the ticket type exists in the ticket type list
					//if it doesn't then add it to the list marking it as hidden.
					if (
						Object.keys(this.ticketTypes).filter(
							tt => tt === hold.ticket_type_id
						).length === 0
					) {
						promises.push(
							Bigneon().redemptionCodes.read({
								code: hold.redemption_code,
								event_id: hold.event_id
							})
						);
					}
				});
				const ticketTypes = [];
				Promise.all(promises)
					.then(responses => {
						responses.forEach(response => {
							const { data } = response;
							if (data.ticket_types && data.ticket_types.length == 1) {
								const ticketType = { hidden: true, ...data.ticket_types[0] };
								ticketTypes[data.ticket_types[0].id] = ticketType;
							}
						});
					})
					.catch(error => {
						console.error(error);
						notifications.showFromErrorResponse({
							error,
							defaultMessage: "Loading ticket holds failed."
						});
					});
				this.ticketTypes = { ...this.ticketTypes, ...ticketTypes };
				this.holds = holds;
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
		Object.keys(this.holds).forEach(id => {
			if (this.holds[id].parent_hold_id) {
				childHolds[id] = this.holds[id];
			}
		});

		return childHolds;
	}
}

const boxOffice = new BoxOffice();

export default boxOffice;
