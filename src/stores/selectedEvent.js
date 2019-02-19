import { observable, action, computed } from "mobx";
import moment from "moment-timezone";
import createGoogleMapsLink from "../helpers/createGoogleMapsLink";
import Bigneon from "../helpers/bigneon";

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
	ticket_types = null;

	@observable
	user_is_interested = null;

	@action
	refreshResult(id, onError = () => {}) {
		//If we're updating the state to a different event just reset the values first so it doesn't load old data in components observing this
		if (id !== this.id) {
			this.event = null;
			this.venue = null;
			this.artists = [];
			this.organization = null;
			this.user_is_interested = null;
		}

		Bigneon()
			.events.read({ id })
			.then(response => {
				const { artists, organization, venue, ...event } = response.data;

				const {
					id,
					event_start,
					door_time,
					promo_image_url,
					ticket_types,
					user_is_interested
				} = event;

				this.ticket_types = ticket_types;
				this.organization = organization;
				this.user_is_interested = user_is_interested;
				this.artists = artists;
				this.venue = { ...venue, googleMapsLink: createGoogleMapsLink(venue) };

				const venueTimezone = venue.timezone || "America/Los_Angeles";
				const eventStartDateMoment = moment.utc(event_start);
				const eventDoorDateMoment = moment.utc(door_time);
				const displayEventStartDate = eventStartDateMoment
					.tz(venueTimezone)
					.format("dddd, MMMM Do YYYY");
				const displayDoorTime = moment(eventDoorDateMoment)
					.tz(venueTimezone)
					.format("h:mm A");
				const displayShowTime = moment(eventStartDateMoment)
					.tz(venueTimezone)
					.format("h:mm A");

				this.id = id;

				this.event = {
					...event,
					eventStartDateMoment,
					displayEventStartDate,
					displayDoorTime,
					displayShowTime,
					promo_image_url: promo_image_url || "/images/event-placeholder.png"
				};
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
	applyRedemptionCode(redemptionCode, onError = error => {}) {
		Bigneon()
			.redemptionCodes.read({ code: redemptionCode })
			.then(
				response => {
					const { data } = response;

					this.ticket_types.forEach((tt, index) => {
						if (data.ticket_type && tt.id === data.ticket_type.id) {
							this.ticket_types[index] = data.ticket_type;
							data.ticket_type = null;
						}
					});
					// if the ticket type is not already present, and the event is
					// this event, add it.
					if (data.ticket_type && data.ticket_type.event_id === this.event.id) {
						this.ticket_types.push(data.ticket_type);
					}
				},
				error => {
					onError(error);
				}
			);
	}

	@action
	toggleUserInterest() {
		if (!this.id) {
			console.error("No event selected.");
			return;
		}

		const interestedStatus = !this.user_is_interested; //Get a true/false value
		this.user_is_interested = interestedStatus; //More responsive to update store first

		if (interestedStatus) {
			//Set to true
			Bigneon()
				.events.interests.create({ event_id: this.id })
				.then(
					() => {
						//If this was clicked twice, make sure current status is set
						this.user_is_interested = true;
					},
					error => {
						//Revert back if api fails
						this.user_is_interested = false;
						console.error(error);
					}
				);
		} else {
			//Set to false
			Bigneon()
				.events.interests.remove({ event_id: this.id })
				.then(
					() => {
						//If this was clicked twice, make sure current status is set
						this.user_is_interested = false;
					},
					error => {
						//Revert back if api fails
						this.user_is_interested = true;
						console.error(error);
					}
				);
		}
	}

	@computed
	get hasAvailableTickets() {
		if (!this.ticket_types) {
			return null; //Unknown
		}

		let hasTickets = false;
		this.ticket_types.map(({ ticket_pricing }) => {
			const price = "";
			if (ticket_pricing) {
				hasTickets = true;
			}
		});

		return hasTickets;
	}
}

const selectedEvent = new SelectedEvent();

export default selectedEvent;
