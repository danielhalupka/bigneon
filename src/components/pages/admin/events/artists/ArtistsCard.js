import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles, Grid } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";

import Button from "../../../../common/Button";
import api from "../../../../../helpers/api";
import notifications from "../../../../../stores/notifications";
import EventArtist from "./EventArtist";
import FormSubHeading from "../../../../common/FormSubHeading";
import AutoCompleteGroup from "../../../../common/form/AutoCompleteGroup";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	content: {
		minHeight: 200
	}
});

class ArtistsCard extends Component {
	constructor(props) {
		super(props);

		let artists = [];

		if (props.artists) {
			artists = props.artists.map(({ artist_id, set_time }) => ({
				id: artist_id,
				setTime: set_time
					? moment.utc(set_time, moment.HTML5_FMT.DATETIME_LOCAL_MS)
					: null
			}));
		}

		this.state = {
			artists,
			showArtistSelect: true,
			availableArtists: null,
			errors: {},
			isSubmitting: false
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

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { artists } = this.state;
		const errors = {};

		for (let index = 0; index < artists.length; index++) {
			const { setTime } = artists[index];
			if (!setTime) {
				if (!errors.artists) {
					errors.artists = {};
				}

				errors.artists[index] = "Specify the set time.";
			}
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	saveArtists(eventId) {
		const { artists } = this.state;

		const artistArray = artists.map(({ id, setTime }) => ({
			artist_id: id,
			set_time: moment.utc(setTime).format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
		}));

		//TODO implement bn-api-node when this works
		// Bigneon()
		// 	.events.artists.update({ event_id: eventId, ...artistArray })
		api()
			.put(`/events/${eventId}/artists`, artistArray)
			.then(response => {
				const { data } = response;

				notifications.show({
					message: "Event artists updated.",
					variant: "success"
				});
				this.props.onNext();
				this.props.history.push(`/admin/events/${eventId}`);
			})
			.catch(error => {
				console.error(error);

				let message = `Adding artist${artists.length > 1 ? "s" : ""} failed.`;
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

	createEvent() {
		const { organizationId } = this.props;

		Bigneon()
			.events.create({ name: "", organization_id: organizationId })
			.then(response => {
				const { id } = response.data;

				this.saveArtists(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Creating event failed.",
					variant: "error"
				});

				this.setState({ isSubmitting: false });
			});
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		const { eventId } = this.props;
		if (eventId) {
			//If we're editing an event we don't need to first creat one
			this.saveArtists(eventId);
		} else {
			this.createEvent();
		}
	}

	addNewArtist(id) {
		this.setState(({ artists }) => {
			artists.push({ id, setTime: null });
			return { artists };
		});
	}

	createNewArtist(name) {
		//TODO make a creatingArtist state var to show it's being done so the user doesn't keep trying
		const artistDetails = { name, bio: "", youtube_video_urls: [] }; //TODO remove youtube_video_urls when it's not needed

		Bigneon()
			.artists.create(artistDetails)
			.then(response => {
				const { id } = response.data;
				//Once inserted we need it in availableArtists right away
				this.setState(({ availableArtists }) => {
					availableArtists.push({ id, ...artistDetails });
					return { availableArtists };
				});

				//Add the
				this.addNewArtist(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Creating new artist failed.";
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

				this.setState({ isSubmitting: false });
			});
	}

	renderAddNewArtist() {
		//Pass through the currently selected artist if one has been selected
		const { availableArtists, artists } = this.state;
		if (availableArtists === null) {
			return <Typography variant="body1">Loading artists...</Typography>;
		}

		const artistsObj = {};
		availableArtists.forEach(artist => {
			artistsObj[artist.id] = artist.name;
		});

		return (
			<AutoCompleteGroup
				style={{ marginBottom: 150 }} //Make space for drop down below
				value={""}
				items={artistsObj}
				name={"artists"}
				label={`${
					artists && artists.length > 0 ? "Supporting" : "Headliner"
				} artist name`}
				onChange={artistId => {
					if (artistId) {
						this.addNewArtist(artistId);
						this.setState({ showArtistSelect: false });
					}
				}}
				formatCreateLabel={label => `Create a new artist "${label}"`}
				onCreateOption={this.createNewArtist.bind(this)}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	render() {
		const {
			isSubmitting,
			artists,
			availableArtists,
			showArtistSelect,
			errors
		} = this.state;

		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent className={classes.content}>
						<FormSubHeading style={{ marginBottom: 20 }}>
							Artists
						</FormSubHeading>
						<Grid item xs={12} sm={12} md={10} lg={8}>
							{artists.map((eventArtist, index) => {
								const { id, setTime } = eventArtist;

								let name = "Loading..."; // If we haven't loaded all the available artists we won't have this guys name yet
								let thumb_image_url = "";
								if (availableArtists) {
									const artist = availableArtists.find(
										artist => artist.id === id
									);

									if (artist) {
										name = artist.name;
										thumb_image_url = artist.thumb_image_url;
									}
								}

								return (
									<EventArtist
										key={index}
										typeHeading={index === 0 ? "Headliner*" : "Supporting"}
										title={name}
										setTime={setTime}
										onChangeSetTime={setTime => {
											this.setState(({ artists }) => {
												artists[index].setTime = setTime;
												return { artists };
											});
										}}
										image={
											thumb_image_url || "/images/profile-pic-placeholder.png"
										}
										error={errors.artists ? errors.artists[index] : null}
										onDelete={() => {
											this.setState(({ artists }) => {
												artists.splice(index, 1);
												return { artists };
											});
										}}
										onBlur={this.validateFields.bind(this)}
									/>
								);
							})}

							{showArtistSelect ? this.renderAddNewArtist() : null}
						</Grid>
					</CardContent>
					<CardActions>
						{!showArtistSelect ? (
							<Button
								style={{ marginRight: 10 }}
								onClick={() => this.setState({ showArtistSelect: true })}
							>
								Add supporting artist
							</Button>
						) : null}

						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							customClassName="callToAction"
						>
							{isSubmitting ? "Saving..." : "Save and continue"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

ArtistsCard.propTypes = {
	eventId: PropTypes.string,
	organizationId: PropTypes.string.isRequired,
	onNext: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
	artists: PropTypes.array
};

export default withStyles(styles)(ArtistsCard);
