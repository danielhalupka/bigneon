import { observable, computed, action } from "mobx";
import moment from "moment";
import Bigneon from "../helpers/bigneon";
import changeUrlParam from "../helpers/changeUrlParam";
import notification from "./notifications";

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
			.events.index({ ...params, status: "Published" }) //Always force published
			.then(response => {
				const events = [];

				const { data, paging } = response.data; //@TODO Implement pagination
				data.forEach(eventData => {
					const { venue, promo_image_url, cancelled_at, ...event } = eventData;

					//TODO remove this when it's added as a filter in the API
					if (cancelled_at) {
						return;
					}

					events.push({
						...event,
						formattedEventDate: moment(
							event.event_start,
							moment.HTML5_FMT.DATETIME_LOCAL_MS
						).format("dddd, MMM D"),
						min_ticket_price: event.min_ticket_price || 0,
						max_ticket_price: event.max_ticket_price || 0,
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

	@action
	clearFilter() {
		changeUrlParam("search", "");
		changeUrlParam("state", "all");
		this.filters = {};

		this.refreshResults(
			{},
			() => {},
			message => {
				notification.show({
					message,
					variant: "error"
				});
			}
		);
	}

	//Instantly filter events by state or other fields
	@computed
	get filteredEvents() {
		if (!this.events) {
			return [];
		}

		const filteredEvents = [];
		this.events.forEach(eventData => {
			const { venue } = eventData;
			const { state } = venue;
			let showEvent = true;

			//If there is a filter and a field to filter in the event entry
			if (this.filters) {
				if (
					state &&
					(!this.filters.state ||
						state === this.filters.state ||
						this.filters.state === "all")
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
		const statesDropdownValues = { all: "Everywhere" };
		if (this.events) {
			this.events.forEach(({ venue }) => {
				const { state } = venue;

				if (state) {
					statesDropdownValues[state] = state;
				}
			});
		}

		const resultArray = Object.keys(statesDropdownValues).map(value => ({
			value,
			label: statesDropdownValues[value]
		}));

		return resultArray;
	}
}

const eventResults = new EventResults();

export default eventResults;
