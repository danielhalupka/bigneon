import { observable, computed, action } from "mobx";
import api from "../helpers/api";
import moment from "moment";

class SelectedEvent {
	@observable
	id = null;

	@observable
	event = null;

	@observable
	venue = null;

	@observable
	artists = [];

	@observable
	organization = null;

	@observable
	ticketPricing = null;

	@action
	refreshResult(id, onError = () => {}) {
		//If we're updating the state to a different event just reset the values first so it doesn't load old data in components observing thi
		if (id !== this.id) {
			this.event = null;
			this.venue = null;
			this.artists = [];
			this.organization = null;
			this.ticketPricing = null;
		}

		api({ auth: false })
			.get(`/events/${id}`)
			.then(response => {
				const { artists, organization, venue, ...event } = response.data;

				const {
					id,
					name,
					created_at,
					event_start,
					organization_id,
					ticket_sell_date,
					venue_id,
					door_time,
					promo_image_url,
					age_limit
				} = event;

				this.organization = organization;

				//TODO maybe this data gets added to the first api call to make it a little smoother

				artists.forEach(({ artist_id }) => {
					this.loadArtist(artist_id);
				});

				const displayEventStartDate = moment(event_start).format(
					"dddd, MMMM Do YYYY"
				);
				const displayDoorTime = moment(door_time).format("hA");
				const displayShowTime = moment(event_start).format("hA");

				let googleMapsLink;
				const { google_places_id, address } = venue;
				if (google_places_id) {
					//TODO check this works once it's added to the API
					//This could even be moved to the back end
					googleMapsLink = `https://www.google.com/maps/place/?q=place_id:${google_places_id}`;
				} else {
					//Try make a google maps search query for missing places ID
					googleMapsLink = `https://www.google.co.za/maps/place/${address
						.split(" ")
						.join("+")}/`;
				}

				this.venue = { ...venue, googleMapsLink };

				this.id = id;

				this.event = {
					...event,
					displayEventStartDate,
					displayDoorTime,
					displayShowTime,
					promo_image_url: `https://picsum.photos/800/400/?image=200` //TODO remove this when image is being saved
				};

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

	@action
	loadArtist(id) {
		api({ auth: false })
			.get(`/artists/${id}`)
			.then(response => {
				const currentArtists = this.artists;

				//Check if we have it in the array, if we do overwrite it. If we don't push it in.
				let existingIndex = null;
				currentArtists.forEach((artist, index) => {
					if (artist.id === id) {
						existingIndex = index;
					}
				});

				if (existingIndex !== null) {
					currentArtists[existingIndex] = response.data;
				} else {
					currentArtists.push(response.data);
				}
				//Have to recreate the array else the observer doesn't detect the update
				this.artists = currentArtists.map(artist => artist);
			})
			.catch(error => {
				console.error(error);

				let message = "Loading artist details failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				//TODO popup notification
			});
	}
}

const selectedEvent = new SelectedEvent();

export default selectedEvent;
