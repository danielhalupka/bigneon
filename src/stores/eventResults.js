import { observable, computed, action } from "mobx";
import api from "../helpers/api";

class EventResults {
	@observable
	events = null;

	@action
	refreshResults(params, onSuccess, onError) {
		api({ auth: false })
			.get(`/events`, { params })
			.then(response => {
				let events = [];

				let demoImageNumber = 100;
				response.data.forEach(event => {
					const {
						id,
						event_start,
						name,
						organization_id,
						ticket_sell_date,
						venue_id
					} = event;

					events.push({
						id,
						name,
						description:
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut tempor lacus, vitae facilisis nisi. Etiam eleifend eros et odio rhoncus, a pellentesque sapien maximus.",
						imgSrc: `https://picsum.photos/800/400/?image=${demoImageNumber}`
					});
					demoImageNumber++;
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
}

const eventResults = new EventResults();

export default eventResults;
