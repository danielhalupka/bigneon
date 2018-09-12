import { observable, computed, action } from "mobx";
import moment from "moment";
import Bigneon from "../helpers/bigneon";

class EventResults {
	@observable
	events = null;

	@observable
	states = [];

	@observable
	filters = {};

	@action
	refreshResults(params, onSuccess, onError) {
		Bigneon()
			.event.index(params)
			.then(response => {
				let events = [];

				response.data.forEach(eventData => {
					const { venue, promo_image_url, cancelled_at, ...event } = eventData;

					//TODO remove this when it's added as a filter in the API
					if (cancelled_at) {
						return;
					}

					//TODO remove this when we're filtering on published events not drafts
					//Make sure they didn't just add artists without other details.
					if (!event.name) {
						return;
					}

					events.push({
						...event,
						formattedEventDate: moment(
							event.event_start,
							moment.HTML5_FMT.DATETIME_LOCAL_MS
						).format("dddd, MMM D"),
						venue,
						promo_image_url: promo_image_url || "/images/event-placeholder.png"
					});
				});

				this.events = events;

				onSuccess();
			})
			.catch(error => {
				console.error(error);

				let message = "Loading events failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				onError(message);
			});
	}

	@action
	changeFilter(key, value) {
		//If value is falsy they're removing a filter
		this.filters[key] = value;
	}

	//Instantly filter events by state or other fields
	@computed
	get filteredEvents() {
		if (!this.events) {
			return [];
		}

		let filteredEvents = [];
		this.events.forEach(eventData => {
			const { venue } = eventData;
			const { state } = venue;
			let showEvent = true;

			//If there is a filter and a field to filter in the event entry
			if (this.filters) {
				if (
					state &&
					(state === this.filters.state || this.filters.state === "all")
				) {
					showEvent = true;
				} else {
					showEvent = false;
				}
			}

			//If all filters passed, show event
			if (showEvent) {
				filteredEvents.push(eventData);
			}
		});

		return filteredEvents;
	}

	//Format it for the drop down
	@computed
	get statesDropdownValues() {
		//Get the state from the event and make an array of states for use in the filter

		let statesDropdownValues = { all: "Everywhere" };
		if (this.events) {
			this.events.forEach(({ venue }) => {
				const { state } = venue;

				if (state) {
					statesDropdownValues[state] = state;
				}
			});
		}

		return statesDropdownValues;
	}
}

const eventResults = new EventResults();

export default eventResults;
