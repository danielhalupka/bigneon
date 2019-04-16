import { observable, computed, action } from "mobx";
import moment from "moment-timezone";
import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import {
	formatEventDataForInputs,
	formatEventDataForSaving
} from "../components/pages/admin/events/updateSections/Details";
import {
	formatArtistsForInputs,
	formatArtistsForSaving
} from "../components/pages/admin/events/updateSections/Artists";
import {
	formatTicketDataForInputs,
	formatTicketDataForSaving
} from "../components/pages/admin/events/updateSections/Tickets";
import { updateTimezonesInObjects } from "../helpers/time";
//TODO separate artists and ticketTypes into their own stores

const freshEvent = formatEventDataForInputs({});

class EventUpdate {
	@observable
	id = null;

	@observable
	organizationId = null;

	@observable
	event = freshEvent;

	@observable
	disabledExternalEvent = false;

	@observable
	organization = {};

	@observable
	venue = {};

	@observable
	artists = [];

	@observable
	ticketTypes = [];

	@observable
	ticketTypeActiveIndex = null;

	@observable
	timezone = "";

	@action
	loadDetails(id) {
		this.id = id;

		Bigneon()
			.events.read({ id })
			.then(response => {
				const { artists, organization, venue, ...event } = response.data;
				const { organization_id } = event;
				const { timezone } = venue;
				const formattedEventData = formatEventDataForInputs(event);
				this.timezone = timezone;
				this.event = formattedEventData;
				this.venue = venue;
				this.artists = formatArtistsForInputs(artists);
				this.organizationId = organization_id;

				this.setTimezone(timezone);

				this.loadTicketTypes(formattedEventData, () =>
					this.loadTimezone(venue.id)
				);

				this.checkIfSalesStarted(id);
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	@action
	loadTicketTypes(event, updateTimezones) {
		if (!this.id) {
			//No event yet, add one ticket by default
			//this.addTicketType();
			updateTimezones();
		}
		Bigneon()
			.events.ticketTypes.index({ event_id: this.id })
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				const ticket_types = data;

				let ticketTypes = [];
				if (ticket_types) {
					ticketTypes = formatTicketDataForInputs(ticket_types, event);
				}

				this.ticketTypes = ticketTypes;
				this.ticketTypeActiveIndex = ticketTypes.length - 1;

				//If there are no ticketType, add one
				// if (this.ticketTypes.length < 1) {
				// 	this.addTicketType();
				// }

				updateTimezones();
			})
			.catch(error => {
				console.error(error);

				notifications.showFromErrorResponse({
					defaultMessage: "Loading event ticket types failed.",
					error
				});

				updateTimezones();
			});
	}

	@action
	addTicketType() {
		//const endDate = this.event.eventDate ? this.event.eventDate : new Date(); //FIXME this will most certainly not work. If a user changes the event date this first ticket type date needs to change.
		const ticketTypes = this.ticketTypes;
		const startDate = moment().set({
			minute: 0,
			second: 0,
			millisecond: 0
		});
		const endDate = moment(this.event.eventDate).add(1, "days");

		const ticketType = {
			name: "",
			description: "",
			capacity: "",
			priceAtDoor: "",
			increment: 1,
			limitPerPerson: 10,
			price_in_cents: "",
			soldOutBehavior: "ShowSoldOut",
			isPrivate: false,
			//By default the server will create a Default ticket price point, anything additional added to this array is an override.
			pricing: [],
			...updateTimezonesInObjects(
				{ startDate, startTime: startDate, endDate },
				this.timezone,
				false
			)
		};

		ticketTypes.push(ticketType);

		this.ticketTypes = ticketTypes;
		this.ticketTypeActiveIndex = ticketTypes.length - 1;
	}

	@action
	ticketTypeActivate(index) {
		this.ticketTypeActiveIndex = index;
	}

	@action
	updateTicketType(index, details) {
		const ticketTypes = this.ticketTypes;

		ticketTypes[index] = { ...ticketTypes[index], ...details };

		this.ticketTypes = ticketTypes;
	}

	@action
	deleteTicketType(index) {
		const ticketTypes = this.ticketTypes;
		const ticketType = ticketTypes[index];

		//If there's an id, it's in the db already so we set the status as cancelled
		if (ticketType.id) {
			ticketType.status = "Cancelled";
			ticketTypes[index] = ticketType;
		} else {
			ticketTypes.splice(index, 1);
		}

		this.ticketTypes = ticketTypes;
	}

	@action
	addTicketPricing(index) {
		const { ticketTypes } = this;

		const { pricing } = ticketTypes[index];
		let startDate = moment(ticketTypes[index].startDate);
		let startTime = moment(ticketTypes[index].startTime);
		const endDate = moment(ticketTypes[index].endDate);
		const endTime = moment(ticketTypes[index].endDate);

		if (pricing.length) {
			startDate = moment(pricing[pricing.length - 1].endDate);
			startTime = moment(pricing[pricing.length - 1].endTime);
		}

		pricing.push({
			id: "",
			ticketId: "",
			name: "",
			startDate,
			startTime,
			endDate,
			endTime,
			value: ticketTypes[index].priceForDisplay || ""
		});

		ticketTypes[index].pricing = pricing;
		this.ticketTypes = ticketTypes;
	}

	@action
	removeTicketPricing(ticketTypeIndex, ticketPriceIndex) {
		const { ticketTypes } = this;

		const { pricing } = ticketTypes[ticketTypeIndex];
		pricing.splice(ticketPriceIndex, 1);

		ticketTypes[ticketTypeIndex].pricing = pricing;
		this.ticketTypes = ticketTypes;
	}

	@action
	updateEvent(eventDetails) {
		this.event = { ...this.event, ...eventDetails };

		//If they're updating the ID, update the root var
		const { id } = eventDetails;
		if (id) {
			this.id = id;
		}

		//Only automatically propagate the eventDate to ticketTypes on new events
		if (!this.id && eventDetails.hasOwnProperty("eventDate")) {
			const { eventDate } = eventDetails;
			this.ticketTypes.forEach((ticketType, index) => {
				this.updateTicketType(index, { endDate: moment(eventDate) });
			});
		}

		//Update the timezone if venue changes
		if (eventDetails.hasOwnProperty("venueId")) {
			const { venueId } = eventDetails;
			this.loadTimezone(venueId);
		}
	}

	@action
	updateOrganizationId(organizationId) {
		this.organizationId = organizationId;
	}

	@action
	updateArtists(artists) {
		this.artists = artists;
	}

	@action
	addArtist(id) {
		const artists = this.artists;
		artists.push({
			id,
			setTime: null,
			importance: artists.length === 0 ? 0 : 1
		});
		this.artists = artists;
	}

	@action
	changeArtistSetTime(index, setTime) {
		const artists = this.artists;
		artists[index].setTime = setTime.clone();

		if (this.timezone) {
			artists[index] = {
				...artists[index],
				...updateTimezonesInObjects(artists[index], this.timezone, true)
			};
		}
		this.artists = artists;
	}

	@action
	changeArtistImportance(index, importance) {
		const artists = this.artists;
		artists[index].importance = importance;
		this.artists = artists;
	}

	@action
	removeArtist(index) {
		const artists = this.artists;
		artists.splice(index, 1);
		this.artists = artists;
	}

	@action
	async saveEventDetails(onId = {}) {
		this.hasSubmitted = true;

		const id = this.id;
		const { artists, event, organizationId, ticketTypes } = this;
		const { isExternal } = event;
		const formattedEventDetails = formatEventDataForSaving(
			event,
			organizationId
		);

		if (id) {
			const saveEventResponse = await this.saveEvent({
				...formattedEventDetails,
				id
			});

			if (!saveEventResponse.result) {
				return saveEventResponse;
			}
		} else {
			const newEventResponse = await this.createNewEvent(formattedEventDetails);
			if (!newEventResponse.result) {
				return newEventResponse;
			}

			this.id = newEventResponse.result;
		}

		onId(this.id);

		if (artists && artists.length > 0) {
			const formattedArtists = formatArtistsForSaving(artists);

			const artistsResult = await this.saveArtists(formattedArtists);
			if (!artistsResult.result) {
				return artistsResult;
			}
		}

		if (!isExternal) {
			const formattedTicketTypes = formatTicketDataForSaving(
				ticketTypes,
				event
			);
			for (let index = 0; index < formattedTicketTypes.length; index++) {
				const ticketType = formattedTicketTypes[index];
				const saveTicketResponse = await this.saveTicketType(
					ticketType,
					formattedTicketTypes
				);
				if (!saveTicketResponse.result) {
					return saveTicketResponse;
				}
			}
		}

		return { result: this.id, error: false };
	}

	async saveEvent(params) {
		return new Promise(resolve => {
			Bigneon()
				.events.update({ ...params, id: this.id })
				.then(id => {
					resolve({ result: id, error: false });
				})
				.catch(error => {
					console.error(error);
					notifications.show({
						message: "Update event failed.",
						variant: "error"
					});
					resolve({ result: false, error });
				});
		});
	}

	async createNewEvent(params) {
		return new Promise(resolve => {
			Bigneon()
				.events.create(params)
				.then(response => {
					const { id } = response.data;
					resolve({ result: id, error: false });
				})
				.catch(error => {
					console.error(error);
					notifications.show({
						message: "Create event failed.",
						variant: "error"
					});
					resolve({ result: false, error });
				});
		});
	}

	async saveArtists(artistsToSave) {
		return new Promise(resolve => {
			Bigneon()
				.events.artists.update({ event_id: this.id, artists: artistsToSave })
				.then(() => {
					resolve({ result: true, error: false });
				})
				.catch(error => {
					console.error(error);
					notifications.show({
						message: "Updating artists failed.",
						variant: "error"
					});
					resolve({ result: false, error });
				});
		});
	}

	async saveTicketType(ticketType, ticketTypeList, recursionDepth) {
		recursionDepth = recursionDepth || 0;
		if (recursionDepth > ticketTypeList.length) {
			return {
				result: false,
				error:
					"Cannot save ticket type because one or more ticket types reference each other"
			};
		}
		const { id, parent_id } = ticketType;
		const event_id = this.id;
		if (!event_id) {
			return { result: false, error: "Event ID is not set yet" };
		}

		// Using != instead of !== here to check for null or undefined
		if (parent_id != null && parseInt(parent_id, 10) === parent_id) {
			if (!ticketTypeList[parent_id].id) {
				// this means it's a reference to an unsaved ticket type, so save that one first
				const result = await this.saveTicketType(
					ticketTypeList[parent_id],
					ticketTypeList,
					recursionDepth + 1
				);

				if (!result.result) {
					return result;
				}
			}
			ticketType.parent_id = ticketTypeList[parent_id].id;
		}

		if (id) {
			return new Promise(resolve => {
				Bigneon()
					.events.ticketTypes.update({
						id,
						event_id,
						...ticketType
					})
					.then(() => {
						resolve({ result: id, error: false });
					})
					.catch(error => {
						console.error(error);
						resolve({ result: false, error });
					});
			});
		} else {
			return new Promise(resolve => {
				Bigneon()
					.events.ticketTypes.create({
						event_id,
						...ticketType
					})
					.then(result => {
						ticketType.id = result.data.id;
						resolve({ result, error: false });
					})
					.catch(error => {
						console.error(error);
						resolve({ result: false, error });
					});
			});
		}
	}

	async cancelTicketType(index) {
		const deleteTicketType = this.deleteTicketType.bind(this);
		return new Promise(resolve => {
			const ticketTypes = this.ticketTypes;
			const ticketType = ticketTypes[index];
			if (ticketType.id) {
				Bigneon()
					.events.ticketTypes.cancel({
						event_id: this.id,
						ticket_type_id: ticketType.id
					})
					.then(result => {
						deleteTicketType(index);
						resolve({ result: result.data, error: false });
					})
					.catch(error => {
						console.error(error);
						notifications.showFromErrorResponse({
							defaultMessage: "Cancelling ticket failed.",
							error
						});
						resolve({ result: false, error });
					});
			} else {
				//It hasn't been saved yet
				deleteTicketType(index);
				resolve({ result: {}, error: false });
			}
		});
	}

	@action
	clearDetails() {
		this.id = null;
		this.event = freshEvent;
		this.artists = [];
		this.venue = {};
		this.organizationId = null;
		this.ticketTypes = [];
		this.ticketTypeActiveIndex = null;
		this.timezone = "";
		this.disabledExternalEvent = false;

		//this.addTicketType();
	}

	//Check if tickets have been sold, if they have the user can't change to be externally ticketed
	checkIfSalesStarted(id) {
		Bigneon()
			.events.dashboard({ id })
			.then(response => {
				const { sold_unreserved, sold_held } = response.data.event;
				if (sold_unreserved || sold_held) {
					this.disabledExternalEvent = true;
				}
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Check for ticket sales failed.",
					error
				});
			});
	}

	loadTimezone(id) {
		Bigneon()
			.venues.read({ id })
			.then(response => {
				const { timezone } = response.data;
				this.setTimezone(timezone);
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to update event timezone."
				});
			});
	}

	/**
	 * Retrieves the timezone from the venue id and
	 * updates every instance of a moment object in use with the new timezone
	 * @params {timezone}
	 */
	setTimezone(timezone) {
		const maintainLocalTime = timezone !== this.timezone || !this.id; //If they're switching timezone or if it's a new event

		if (timezone) {
			this.timezone = timezone;

			//Get all moment objects, update the timezone and set them again
			const eventDetails = updateTimezonesInObjects(
				this.event,
				timezone,
				maintainLocalTime
			);
			this.updateEvent(eventDetails);

			//Update artist set times
			this.artists.forEach((artist, index) => {
				const { setTime } = artist;
				if (setTime) {
					const newSetTime = updateTimezonesInObjects(
						{ setTime },
						timezone,
						maintainLocalTime
					).setTime;
					if (newSetTime) {
						this.changeArtistSetTime(index, newSetTime);
					}
				}
			});

			//Update ticket type start/end date/times
			this.ticketTypes.forEach((ticketType, index) => {
				const updateTicketTypeDates = updateTimezonesInObjects(
					ticketType,
					timezone,
					maintainLocalTime
				);

				const { pricing } = ticketType;

				//Update all pricing date/times
				const updatedPricing = [];
				pricing.forEach((pricePoint, index) => {
					updatedPricing.push({
						...pricePoint,
						...updateTimezonesInObjects(pricePoint, timezone, maintainLocalTime)
					});
				});

				this.updateTicketType(index, {
					...updateTicketTypeDates,
					pricing: updatedPricing
				});
			});
		}
	}
}

const eventUpdateStore = new EventUpdate();

export default eventUpdateStore;
