import { observable, computed, action } from "mobx";
import api from "../helpers/api";

class EventResults {
	@observable
	events = null;

	@observable
	states = [];

	@observable
	filters = {};

	@action
	refreshResults(params, onSuccess, onError) {
		api({ auth: false })
			.get(`/events`, { params })
			.then(response => {
				let events = [];

				let demoImageNumber = 10;
				response.data.forEach(eventData => {
					const { event, venue } = eventData;

					//TODO remove this when we're filtering on published events not drafts
					//Make sure they didn't just add artists without other details.
					if (event.name) {
						events.push({
							event: {
								...event,
								description:
									"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut tempor lacus, vitae facilisis nisi. Etiam eleifend eros et odio rhoncus, a pellentesque sapien maximus.",
								imgSrc: `https://picsum.photos/800/400/?image=${demoImageNumber}`
							},
							venue
						});
						demoImageNumber++;
					}
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

		// if (state) {
		// 	states.push(state);
		// }

		// this.states.forEach(state => {
		// 	statesDropdownValues[state] = state;
		// });

		return statesDropdownValues;
	}
}

const eventResults = new EventResults();

export default eventResults;
