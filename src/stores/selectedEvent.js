import { observable, computed, action } from "mobx";
import api from "../helpers/api";
import moment from "moment";

//TODO make add all fields to this model when they come from the API
class SelectedEvent {
	@observable
	id = null;

	@observable
	eventDetails = null;

	@observable
	artists = null;

	@observable
	ticketPricing = null;

	@action
	refreshResult(id, onError = () => {}) {
		//If we're updating the state to a different event just reset the values first so it doesn't load old data in components observing thi
		if (id !== this.id) {
			this.eventDetails = null;
			this.artists = null;
		}

		api({ auth: false })
			.get(`/events/${id}`)
			.then(response => {
				const {
					id,
					name,
					created_at,
					event_start,
					organization_id,
					ticket_sell_date,
					venue_id
				} = response.data;

				const displayEventStartDate = moment(event_start).format(
					"dddd, MMMM Do YYYY"
				);
				this.id = id;
				this.eventDetails = { ...response.data, displayEventStartDate };

				//TODO retrieve artists when API is ready
				this.artists = [];

				//TODO retrieve ticket pricing when API is ready
				this.ticketPricing = [
					{
						id: "123",
						name: "General standing",
						description: "Lorem lorem lorem lorem lorem lorem lorem",
						price: 1
					},
					{
						id: "456",
						name: "VIP",
						description: "For like super important people",
						price: 999
					}
				];
			})
			.catch(error => {
				console.error(error);

				let message = "Loading event details failed.";
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

const selectedEvent = new SelectedEvent();

export default selectedEvent;
