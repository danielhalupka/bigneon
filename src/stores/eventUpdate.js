import { observable, computed, action } from "mobx";
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

const freshEvent = formatEventDataForInputs({});
class EventUpdate {
	@observable
	id = null;

	@observable
	organizationId = null;

	@observable
	event = freshEvent;

	@observable
	organization = {};

	@observable
	venue = {};

	@observable
	artists = [];

	@action
	loadDetails(id) {
		this.id = id;

		Bigneon()
			.events.read({ id })
			.then(response => {
				const { artists, organization, venue, ...event } = response.data;
				const { organization_id } = event;
				this.event = formatEventDataForInputs(event);
				this.artists = formatArtistsForInputs(artists);
				this.venue = venue;
				this.organizationId = organization_id;
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

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	@action
	updateEvent(eventDetails) {
		this.event = { ...this.event, ...eventDetails };

		//If they're updating the ID, update the root var
		const { id } = eventDetails;
		if (id) {
			console.log("Update id: ", id);
			//this.id = id;
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
	async saveEventDetails() {
		this.hasSubmitted = true;

		let id = this.id;
		const { artists, event, organizationId } = this;

		const formattedEventDetails = formatEventDataForSaving(
			event,
			organizationId
		);

		if (id) {
			const result = await this.saveEvent(formattedEventDetails);
			if (!result) {
				return false;
			}
		} else {
			const id = await this.createNewEvent(formattedEventDetails);
			if (!id) {
				return false;
			}

			this.id = id;
		}

		const formattedArtists = formatArtistsForSaving(artists);

		const artistsResult = this.saveArtists(formattedArtists);
		if (!artistsResult) {
			return false;
		}

		//TODO save/update tickets

		return true;
	}

	async saveEvent(params) {
		return new Promise(resolve => {
			Bigneon()
				.events.update({ ...params, id: this.id })
				.then(id => {
					resolve(id);
				})
				.catch(error => {
					console.error(error);
					notifications.show({
						message: "Update event failed.",
						variant: "error"
					});
					resolve(false);
				});
		});
	}

	async createNewEvent(params) {
		return new Promise(resolve => {
			Bigneon()
				.events.create(params)
				.then(response => {
					const { id } = response.data;
					resolve(id);
				})
				.catch(error => {
					console.error(error);
					notifications.show({
						message: "Create event failed.",
						variant: "error"
					});
					resolve(false);
				});
		});
	}

	async saveArtists(artistsToSave) {
		return new Promise(resolve => {
			Bigneon()
				.events.artists.update({ event_id: this.id, artists: artistsToSave })
				.then(() => {
					resolve(true);
				})
				.catch(error => {
					console.error(error);
					notifications.show({
						message: "Updating artists failed.",
						variant: "error"
					});
					resolve(false);
				});
		});
	}

	@action
	clearDetails() {
		this.id = null;
		this.event = freshEvent;
		this.artists = [];
		this.venue = {};
		this.organizationId = null;
	}
}

const eventUpdateStore = new EventUpdate();

export default eventUpdateStore;
