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

	@action
	refreshEvents() {
		let organization_id = user.currentOrganizationId;

		if (!organization_id) {
			this.timeout = setTimeout(() => this.refreshEvents(), 500);
			return;
		}

		Bigneon()
			.organizations.events.index({ organization_id })
			.then(response => {
				const { data, paging } = response.data;
				this.availableEvents = data;

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

	loadCachedCurrentEvent() {
		let cachedActiveEventId = localStorage.getItem("boxOfficeActiveEventId");
		const activeEvent = getEventFromId(
			this.availableEvents,
			cachedActiveEventId
		);
		if (activeEvent) {
			this.setActiveEventId(cachedActiveEventId);
		} else if (this.availableEvents.length > 0) {
			//If it doesn't exist locally assume first event
			this.setActiveEventId(this.availableEvents[0].id);
		} else {
			//If the don't have any events
			this.setActiveEventId(false);
		}
	}

	@action
	setActiveEventId(id, reloadPage = false) {
		this.activeEventId = id;

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
}

const boxOffice = new BoxOffice();

export default boxOffice;
