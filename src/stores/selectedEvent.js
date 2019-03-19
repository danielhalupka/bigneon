import { observable, action, computed } from "mobx";
import moment from "moment-timezone";

import createGoogleMapsLink from "../helpers/createGoogleMapsLink";
import Bigneon from "../helpers/bigneon";
import changeUrlParam from "../helpers/changeUrlParam";
import notification from "./notifications";
import errorReporting from "../helpers/errorReporting";
import getUrlParam from "../helpers/getUrlParam";

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

	private_access_code = null;

	@observable
	showPrivateAccessCodeInputDialog = false;

	@observable
	privateAccessCodeError = "";

	@action
	refreshResult(id, onError = () => {}) {
		//If we're updating the state to a different event just reset the values first so it doesn't load old data in components observing this
		if (id !== this.id) {
			this.event = null;
			this.venue = null;
			this.artists = [];
			this.organization = null;
			this.user_is_interested = null;
			this.private_access_code = null;
			this.showPrivateAccessCodeInputDialog = false;
			this.privateAccessCodeError = "";
		}

		this.id = id;

		const query = { id };
		
		const private_access_code = getUrlParam("private_access_code") || this.private_access_code;

		//const private_access_code = url ? url.searchParams.get("private_access_code") : this.private_access_code;
		if (private_access_code) {
			query.private_access_code = private_access_code;
			this.private_access_code = private_access_code;
		}
		
		//Temp fix to catch and handle the odd occasion where `Bigneon().events.read` is not a function.
		//Attempt to instantiate again, wait a second and try the api call again.
		//Hard limit on 10 refresh attempts and then display an error message to the user.
		//Also adds additional sentry logging for debugging what the root cause is.
		const readEventFunction = Bigneon().events.read;
		if (!readEventFunction || {}.toString.call(readEventFunction) !== "[object Function]") {
			if (isNaN(this.refreshAttempts)) {
				this.refreshAttempts = 0;
			}

			this.refreshAttempts++;

			//Try 10 times
			if (this.refreshAttempts <= 10) {
				errorReporting.addBreadcrumb(`refreshResult attempt ${this.refreshAttempts}`);

				errorReporting.addBreadcrumb(`Bigneon() typeof: ${typeof Bigneon()}`);
				errorReporting.addBreadcrumb(`Bigneon(): ${Bigneon()}`);

				errorReporting.addBreadcrumb(`Bigneon().events typeof: ${typeof Bigneon().events}`);
				errorReporting.addBreadcrumb(`Bigneon().events: ${Bigneon().events}`);

				errorReporting.addBreadcrumb(`Bigneon().events.read typeof: ${typeof Bigneon().events.read}`);
				errorReporting.addBreadcrumb(`Bigneon().events.read: ${Bigneon().events.read}`);

				let cache = [];
				const bnStringObj = JSON.stringify(Bigneon().events, function(key, value) {
					if (typeof value === "object" && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Duplicate reference found
							try {
								// If this value does not reference a parent it can be deduped
								return JSON.parse(JSON.stringify(value));
							} catch (error) {
								// discard key if value cannot be deduped
								return;
							}
						}
						// Store value in our collection
						cache.push(value);
					}
					return value;
				});
				cache = null;

				errorReporting.addBreadcrumb(bnStringObj);

				Object.keys(Bigneon().events).forEach(key => {
					errorReporting.addBreadcrumb(`Bigneon().events: ${key} => ${Bigneon().events[key]}`);
				});

				errorReporting.captureMessage("Bigneon().events.read is not a function. Real value in bread crumb.");

				Bigneon({}, {}, null, true);

				return setTimeout(() => {
					this.refreshResult(id, onError);
				}, 500);
			} else {
				//Give up, it's not happening
				errorReporting.captureMessage(`Bigneon().events.read is not a function. Attempted ${this.refreshAttempts} times.`);
				onError("Failed to load event. Please refresh.");
				return;
			}

		}

		Bigneon()
			.events.read(query)
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

				this.event = {
					...event,
					eventStartDateMoment,
					displayEventStartDate,
					displayDoorTime,
					displayShowTime,
					promo_image_url: promo_image_url || "/images/event-placeholder.png"
				};

				//If we got the code from this store, append it to the url for any route changes
				if (private_access_code) {
					changeUrlParam("private_access_code", private_access_code);
				}
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

				//For 401, show the dialog for entering a private code
				if (error.response && error.response.status && error.response.status === 401) {
					this.private_access_code = null;
					this.showPrivateAccessCodeInputDialog = true;
					this.privateAccessCodeError = private_access_code ? "Incorrect code." : "";
				} else {
					onError(message);
				}
			});
	}

	retryRefreshWithCode(code) {
		this.private_access_code = code;
		changeUrlParam("private_access_code", "");

		this.refreshResult(this.id, (error) => {
			console.log("Code attempt failed");
			notification.showFromErrorResponse({
				defaultMessage: "Failed to load event with access code.",
				error
			});

			this.private_access_code = null;
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
