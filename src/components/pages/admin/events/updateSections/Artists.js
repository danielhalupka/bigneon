import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";

import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import AutoCompleteGroup from "../../../../common/form/AutoCompleteGroup";
import Bigneon from "../../../../../helpers/bigneon";
import EventArtist from "./EventArtist";
import LeftAlignedSubCard from "../../../../elements/LeftAlignedSubCard";
import eventUpdateStore from "../../../../../stores/eventUpdate";
import user from "../../../../../stores/user";

const styles = theme => ({
	paddedContent: {
		paddingRight: theme.spacing.unit * 12,
		paddingLeft: theme.spacing.unit * 12,
		marginTop: theme.spacing.unit * 4
	}
});

const formatForSaving = artists => {
	const artistArray = artists.map(({ id, setTime }) => ({
		artist_id: id,
		set_time: setTime
			? moment.utc(setTime).format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
			: null
	}));

	return artistArray;
};

const formatForInput = artistArray => {
	const artists = artistArray.map(({ artist, set_time }) => {
		return {
			id: artist.id,
			setTime: set_time
				? moment.utc(set_time, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
				: null
		};
	});

	return artists;
};

@observer
class ArtistDetails extends Component {
	debounceSearch = false;

	constructor(props) {
		super(props);

		this.state = {
			artists: props.artists,
			showArtistSelect: false,
			availableArtists: null,
			spotifyAvailableArtists: null,
			spotifyArtists: {},
			isSubmitting: false,
			isSearching: false
		};
	}

	componentDidMount() {
		Bigneon()
			.artists.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ availableArtists: data });
			})
			.catch(error => {
				console.error(error);

				let message = "Loading artists failed.";
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

	addNewArtist(id) {
		const { spotifyArtists } = this.state;

		if (spotifyArtists.hasOwnProperty(id)) {
			//Add spotifyArtist
			this.createNewArtist({ spotify_id: id });
			return;
		}

		eventUpdateStore.addArtist(id);

		if (eventUpdateStore.artists.length === 1) {
			const { availableArtists } = this.state;
			const selectedArtist = availableArtists.find(a => a.id === id);
			if (selectedArtist && selectedArtist.image_url) {
				if (!eventUpdateStore.event.promoImageUrl) {
					//Assume the promo image is the headliner artist
					eventUpdateStore.updateEvent({
						promoImageUrl: selectedArtist.image_url
					});
				}

				//If here's no event name yet, assume the event name to be the headlining artist
				if (!eventUpdateStore.event.name) {
					eventUpdateStore.updateEvent({ name: selectedArtist.name });
				}
			}
		}
	}

	onDelete(index) {
		const { event, artists } = eventUpdateStore;
		const { availableArtists } = this.state;
		const id = artists[index].id;
		const selectedArtist = availableArtists.find(a => a.id === id);
		const currentEventPromoUrl = event.promoImageUrl || "";

		//If the event promo image was set by this artist, remove it
		if (currentEventPromoUrl === selectedArtist.image_url) {
			eventUpdateStore.updateEvent({
				promoImageUrl: ""
			});
		}

		eventUpdateStore.removeArtist(index);
	}

	createNewArtist(nameOrObj) {
		//TODO make a creatingArtist state var to show it's being done so the user doesn't keep trying
		const defaultNewArtist = {
			bio: "",
			youtube_video_urls: [],
			organization_id: user.currentOrganizationId
		};
		if (typeof nameOrObj === "string") {
			nameOrObj = {
				name: nameOrObj
			};
		}
		const artistDetails = {
			...defaultNewArtist,
			...nameOrObj
		}; //TODO remove youtube_video_urls when it's not needed

		Bigneon()
			.artists.create(artistDetails)
			.then(response => {
				const { id } = response.data;
				//Once inserted we need it in availableArtists right away
				this.setState(({ availableArtists }) => {
					availableArtists.push(response.data);
					return { availableArtists };
				});

				//Add the
				this.addNewArtist(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Creating new artist failed.",
					error
				});

				this.setState({ isSubmitting: false });
			});
	}

	search(searchName) {
		this.setState({ isSearching: true });
		clearTimeout(this.debounceSearch);
		if (!searchName.trim()) {
			return;
		}

		this.debounceSearch = setTimeout(async () => {
			try {
				let results = await Bigneon().artists.search({
					q: searchName,
					spotify: 1
				});
				results = results.data.data;
				let spotifyArtists = {};
				results
					.filter(artist => !artist.id && artist.spotify_id)
					.forEach(artist => {
						spotifyArtists[artist.spotify_id] = true;
					});
				this.setState({
					isSearching: false,
					spotifyAvailableArtists: results,
					spotifyArtists
				});
			} catch (e) {
				this.setState({ isSearching: false });
				console.error(e);
			}
		}, 500);
	}

	renderAddNewArtist() {
		//Pass through the currently selected artist if one has been selected
		const {
			availableArtists,
			spotifyAvailableArtists,
			isSearching
		} = this.state;
		if (availableArtists === null) {
			return <Typography variant="body1">Loading artists...</Typography>;
		}

		const artistsObj = {};
		availableArtists.forEach(artist => {
			let id = artist.id || artist.spotify_id;
			artistsObj[id] = artist.name;
		});

		if (spotifyAvailableArtists) {
			spotifyAvailableArtists.forEach(artist => {
				let id = artist.id || artist.spotify_id;
				artistsObj[id] = artist.name;
			});
		}

		const { artists } = eventUpdateStore;

		const isHeadline = artists && artists.length < 1;

		return (
			<AutoCompleteGroup
				value={""}
				items={artistsObj}
				name={"artists"}
				label={`Add your ${isHeadline ? "headline act*" : "supporting act"}`}
				onInputChange={this.search.bind(this)}
				placeholder={"eg. Childish Gambino"}
				onChange={artistId => {
					if (artistId) {
						this.addNewArtist(artistId);
						this.setState({ showArtistSelect: false });
					}
				}}
				formatCreateLabel={label =>
					isSearching
						? `Searching artists for ${label} - Click here to skip search and create`
						: `Create a new artist "${label}"`
				}
				onCreateOption={this.createNewArtist.bind(this)}
			/>
		);
	}

	render() {
		const { classes, errors } = this.props;
		const { availableArtists, showArtistSelect } = this.state;
		const { artists } = eventUpdateStore;

		return (
			<div>
				{artists.map((eventArtist, index) => {
					const { id, setTime } = eventArtist;

					let name = "Loading..."; // If we haven't loaded all the available artists we won't have this guys name yet
					let thumb_image_url = "";
					let socialAccounts = {};
					if (availableArtists) {
						const artist = availableArtists.find(artist => artist.id === id);

						if (artist) {
							name = artist.name;
							thumb_image_url = artist.thumb_image_url || artist.image_url;
							const {
								bandcamp_username,
								facebook_username,
								instagram_username,
								snapchat_username,
								soundcloud_username,
								website_url
							} = artist;
							socialAccounts = {
								bandcamp: bandcamp_username,
								facebook: facebook_username,
								instagram: instagram_username,
								snapchat: snapchat_username,
								soundcloud: soundcloud_username,
								website: website_url
							};
						}
					}

					return (
						<LeftAlignedSubCard key={index}>
							<EventArtist
								socialAccounts={socialAccounts}
								typeHeading={index === 0 ? "Headline act *" : "Supporting act"}
								title={name}
								setTime={setTime}
								onChangeSetTime={setTime => {
									eventUpdateStore.changeArtistSetTime(index, setTime);
								}}
								imgUrl={
									thumb_image_url || "/images/profile-pic-placeholder.png"
								}
								error={errors ? errors[index] : null}
								onDelete={() => this.onDelete(index)}
							/>
						</LeftAlignedSubCard>
					);
				})}

				<div className={classes.paddedContent}>
					{showArtistSelect || artists.length === 0
						? this.renderAddNewArtist()
						: null}

					{artists.length > 0 && !showArtistSelect ? (
						<Button
							variant="additional"
							onClick={() => this.setState({ showArtistSelect: true })}
						>
							Add supporting artist
						</Button>
					) : null}
				</div>
			</div>
		);
	}
}

ArtistDetails.propTypes = {
	eventId: PropTypes.string,
	artists: PropTypes.array.isRequired,
	errors: PropTypes.object.isRequired
};

export const Artists = withStyles(styles)(ArtistDetails);
export const formatArtistsForSaving = formatForSaving;
export const formatArtistsForInputs = formatForInput;
