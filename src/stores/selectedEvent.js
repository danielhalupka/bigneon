import { observable, action, computed } from "mobx";
import moment from "moment-timezone";

import createGoogleMapsLink from "../helpers/createGoogleMapsLink";
import Bigneon from "../helpers/bigneon";
import changeUrlParam from "../helpers/changeUrlParam";
import notifications from "./notifications";
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

	@observable
	currentlyAppliedCode = null;

	@action
	refreshResult(id, onError = () => {}) {
		//If we're updating the state to a different event just reset the values first so it doesn't load old data in components observing this
		if (this.id && id !== this.id) {
			this.event = null;
			this.venue = null;
			this.artists = [];
			this.organization = null;
			this.user_is_interested = null;
			this.private_access_code = null;
			this.showPrivateAccessCodeInputDialog = false;
			this.privateAccessCodeError = "";
			this.currentlyAppliedCode = null;
		}

		this.id = id;

		const query = { id };

		const private_access_code =
			getUrlParam("private_access_code") || this.private_access_code;

		//const private_access_code = url ? url.searchParams.get("private_access_code") : this.private_access_code;
		if (private_access_code) {
			query.private_access_code = private_access_code;
			this.private_access_code = private_access_code;
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

				// this.ticket_types = ticket_types;
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

				//If we have a promo code, load it first to apply to the new ticket types retrieved
				if (this.currentlyAppliedCode) {
					this.applyRedemptionCode(
						this.currentlyAppliedCode,
						ticket_types,
						() => {},
						() => {}
					);
				} else {
					//If we're not using a promo code, just set the ticket types as is
					this.ticket_types = ticket_types;
				}

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
				if (
					error.response &&
					error.response.status &&
					error.response.status === 401
				) {
					this.private_access_code = null;
					this.showPrivateAccessCodeInputDialog = true;
					this.privateAccessCodeError = private_access_code
						? "Incorrect code."
						: "";
				} else {
					onError(message);
				}
			});
	}

	retryRefreshWithCode(code) {
		this.private_access_code = code;
		changeUrlParam("private_access_code", "");

		this.refreshResult(this.id, error => {
			notifications.showFromErrorResponse({
				defaultMessage: "Failed to load event with access code.",
				error
			});

			this.private_access_code = null;
		});
	}

	@action
	applyRedemptionCode(
		redemptionCode,
		ticketTypes,
		onSuccess = () => {},
		onError = () => {}
	) {
		const updatedTicketTypes = ticketTypes || this.ticket_types;

		Bigneon()
			.redemptionCodes.read({ code: redemptionCode, event_id: this.id })
			.then(
				response => {
					const { data } = response;
					const appliedCodes = {};

					const inactiveTicketNames = [];

					//For promo codes (New data format)
					if (data.ticket_types && typeof data.ticket_types === "object") {
						data.ticket_types.forEach(codeTicketType => {
							if (codeTicketType.status === "NoActivePricing") {
								inactiveTicketNames.push(codeTicketType.name);
							} else {
								codeTicketType.discount_as_percentage =
									data.discount_as_percentage;
								let existingTicketTypeIndex = null;
								updatedTicketTypes.forEach((et, index) => {
									if (et.id == codeTicketType.id) {
										existingTicketTypeIndex = index;
									}
								});

								//Overwrite existing ticket type
								if (existingTicketTypeIndex !== null) {
									updatedTicketTypes[existingTicketTypeIndex] = codeTicketType;
								} else {
									//Add missing ticket type, it's revealed with a code
									updatedTicketTypes.push(codeTicketType);
								}

								appliedCodes[codeTicketType.id] =
									codeTicketType.redemption_code;
							}
						});
					}

					//If we only got back tickets that had no active pricings (No successful code applications)
					if (
						inactiveTicketNames.length > 0 &&
						Object.keys(appliedCodes).length === 0
					) {
						onError();

						notifications.show({
							message:
								"Promo code is valid but ticket is currently unavailable.",
							variant: "warning"
						});
					} else {
						this.currentlyAppliedCode = redemptionCode;

						this.ticket_types = updatedTicketTypes;
						onSuccess(appliedCodes);
					}
				},
				error => {
					this.ticket_types = updatedTicketTypes;

					onError();

					if (error && error.response && error.response.status === 404) {
						this.currentlyAppliedCode = null;
						notifications.show({
							message: "Promo code does not exist.",
							variant: "warning"
						});
					} else {
						notifications.showFromErrorResponse({
							defaultMessage: "Failed to apply promo code.",
							error
						});
					}
				}
			);
	}

	@action
	removePromoCodesFromTicketTypes() {
		if (this.ticket_types) {
			this.ticket_types.forEach((tt, index) => {
				delete tt.redemption_code;
				this.ticket_types[index] = tt;
			});
		}

		this.currentlyAppliedCode = null;
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

	// @computed
	// get currentlyAppliedCode() {
	// 	return "FIXME";
	// }
}

const selectedEvent = new SelectedEvent();

export default selectedEvent;
