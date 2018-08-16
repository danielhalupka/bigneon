import React, { Component } from "react";
import { Typography, withStyles, InputLabel } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import moment from "moment";

import EventArtist from "./EventArtist";
import FormSubHeading from "../../../common/FormSubHeading";
import InputGroup from "../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../common/form/SelectGroup";
import Button from "../../../common/Button";
import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	promoImage: {
		width: "100%",
		height: 300,
		borderRadius: theme.shape.borderRadius
	}
});

class Event extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing event
		let eventId = null;
		if (props.match && props.match.params && props.match.params.id) {
			eventId = props.match.params.id;
		}

		this.state = {
			eventId,
			showArtistSelect: true,
			name: "",
			eventDate: null,
			doorTime: null,
			ageLimit: "",
			additionalInfo: "",
			organizations: null,
			artists: [],
			availableArtists: [],
			organizationId: "",
			venues: null,
			venueId: "",
			status: "",
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { eventId } = this.state;

		if (eventId) {
			api()
				.get(`/events/${eventId}`)
				.then(response => {
					const {
						name,
						event_start,
						venue_id,
						organization_id
					} = response.data;

					this.loadVenues(organization_id);

					this.setState({
						name: name || "",
						eventDate: event_start
							? moment(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
							: null,
						venueId: venue_id ? venue_id : "",
						organizationIcd: organization_id ? organization_id : ""
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });

					let message = "Loading venue details failed.";
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
		} else {
			//TODO get this org owners org ID so we're not loading all
			const organization_id = null;
			this.loadVenues(organization_id);
		}

		api()
			.get("/organizations")
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);

				let message = "Loading organizations failed.";
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

		api()
			.get("/artists")
			.then(response => {
				const { data } = response;
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

	loadVenues(organizationId) {
		this.setState({ venues: null }, () => {
			//TODO use the org id once an admin can assign a venue to an org
			//TODO use `/venues/organizations/${organizationId}`
			api()
				.get(`/venues`)
				.then(response => {
					const { data } = response;
					this.setState({ venues: data });
				})
				.catch(error => {
					console.error(error);

					let message = "Loading venues failed.";
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
		});
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return null;
		}

		const {
			name,
			artists,
			eventDate,
			doorTime,
			ageLimit,
			organizationId,
			venueId,
			additionalInfo,
			status
		} = this.state;

		const errors = {};

		errors.artists = {};
		for (let index = 0; index < artists.length; index++) {
			const { setTime } = artists[index];
			if (!setTime) {
				errors.artists[index] = "Specify the set time.";
			}
		}

		if (!name) {
			errors.name = "Missing event name.";
		}

		if (!organizationId) {
			errors.organizationId = "Choose an organization.";
		}

		if (!venueId) {
			errors.venueId = "Choose venue.";
		}

		if (!eventDate) {
			errors.eventDate = "Specify the event date.";
		}

		if (!doorTime) {
			errors.doorTime = "Specify the door time.";
		}

		if (!status) {
			errors.status = "Specify status of this event.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	createNewEvent(params, onSuccess) {
		api()
			.post("/events", params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Create event failed.",
					variant: "error"
				});
			});
	}

	updateEvent(id, params, onSuccess) {
		api()
			.put(`/events/${id}`, { ...params, id })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Update event failed.",
					variant: "error"
				});
			});
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		const {
			eventId,
			name,
			eventDate,
			organizationId,
			venueId,
			artists,
			doorTime,
			ageLimit,
			additionalInfo,
			status
		} = this.state;

		const eventDetails = {
			name,
			venue_id: venueId,
			event_start: moment
				.utc(eventDate)
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS), //This format --> "2018-09-18T23:56:04"
			organization_id: organizationId,
			artists,
			doorTime,
			ageLimit,
			additionalInfo,
			status
		};

		console.log("Post to API: ");
		console.log(eventDetails);

		//If we're updating an existing venue
		if (eventId) {
			this.updateEvent(eventId, eventDetails, id => {
				notifications.show({
					message: "Event updated.",
					variant: "success"
				});

				this.props.history.push("/admin/events");
			});

			return;
		}

		this.createNewEvent(eventDetails, id => {
			notifications.show({
				message: "Event created.",
				variant: "success"
			});

			this.props.history.push("/admin/events");
		});
	}

	addNewArtist(id) {
		this.setState(({ artists, doorTime }) => {
			artists.push({ id, setTime: doorTime });
			return { artists };
		});
	}

	renderOrganizations() {
		const { organizationId, organizations, errors } = this.state;
		if (organizations === null) {
			return <Typography variant="body1">Loading organizations...</Typography>;
		}

		const organizationsObj = {};

		organizations.forEach(organization => {
			organizationsObj[organization.id] = organization.name;
		});

		return (
			<SelectGroup
				value={organizationId}
				items={organizationsObj}
				error={errors.organizationId}
				name={"organization"}
				label={"Organization"}
				onChange={e => {
					const organizationId = e.target.value;
					this.setState({ organizationId });
					//Reload venues belonging to this org
					this.loadVenues(organizationId);
				}}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	renderAddNewArtist() {
		//Pass through the currently selected artist if one has been selected
		const { availableArtists, errors } = this.state;
		if (availableArtists === null) {
			return <Typography variant="body1">Loading artists...</Typography>;
		}

		const artistsObj = {};

		availableArtists.forEach(artist => {
			artistsObj[artist.id] = artist.name;
		});

		return (
			<SelectGroup
				value={""}
				items={artistsObj}
				name={"artists"}
				label={"Artist"}
				onChange={e => {
					const artistId = e.target.value;
					this.setState({ showArtistSelect: false });
					this.addNewArtist(artistId);
				}}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	renderVenues() {
		const { venueId, venues, errors } = this.state;

		const venuesObj = {};

		let lable = "";

		if (venues !== null) {
			venues.forEach(venue => {
				venuesObj[venue.id] = venue.name;
			});
			lable = "Venue";
		} else {
			lable = "Loading venues...";
		}

		return (
			<SelectGroup
				value={venueId}
				items={venuesObj}
				error={errors.venueId}
				name={"venues"}
				missingItemsLabel={"No available venues"}
				label={lable}
				onChange={e => {
					const venueId = e.target.value;
					this.setState({ venueId });
				}}
				onBlur={this.validateFields.bind(this)}
			/>
		);
	}

	render() {
		const {
			eventId,
			showArtistSelect,
			artists,
			availableArtists,
			name,
			eventDate,
			doorTime,
			ageLimit,
			additionalInfo,
			status,
			errors,
			isSubmitting
		} = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">
					{eventId ? "Update" : "New"} event
				</Typography>

				<Card className={classes.paper}>
					<form
						noValidate
						autoComplete="off"
						onSubmit={this.onSubmit.bind(this)}
					>
						<CardContent>
							<Grid container spacing={24}>
								<FormSubHeading>Artists</FormSubHeading>

								<Grid item xs={12} sm={12} md={10} lg={8}>
									{artists.map((eventArtist, index) => {
										const { id, setTime } = eventArtist;
										const artist = availableArtists.find(
											artist => artist.id === id
										);

										const { name } = artist;

										return (
											<EventArtist
												key={id}
												typeHeading={index === 0 ? "Headliner*" : "Supporting"}
												title={name}
												setTime={setTime}
												onChangeSetTime={setTime => {
													this.setState(({ artists }) => {
														artists[index].setTime = setTime;
														return { artists };
													});
												}}
												image={`https://picsum.photos/300/300/?image=${index +
													100}`}
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

									{!showArtistSelect ? (
										<Button
											onClick={() => this.setState({ showArtistSelect: true })}
										>
											Add another artist
										</Button>
									) : null}

									{showArtistSelect ? this.renderAddNewArtist() : null}
								</Grid>

								<FormSubHeading>Event details</FormSubHeading>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Event name"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									{this.renderVenues()}
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<DateTimePickerGroup
										error={errors.eventDate}
										value={eventDate}
										name="eventDate"
										label="Event date"
										onChange={eventDate => this.setState({ eventDate })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<DateTimePickerGroup
										error={errors.doorTime}
										value={doorTime}
										name="doorTime"
										label="Door time"
										onChange={doorTime => this.setState({ doorTime })}
										onBlur={this.validateFields.bind(this)}
										format="HH:mm"
										type="time"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.ageLimit}
										value={ageLimit}
										name="ageLimit"
										label="Age limit"
										type="number"
										onChange={e => this.setState({ ageLimit: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.additionalInfo}
										value={additionalInfo}
										name="additionalInfo"
										label="Additional info"
										type="text"
										onChange={e =>
											this.setState({ additionalInfo: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										multiline
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<div style={{ marginTop: 20, marginBottom: 10 }}>
										<InputLabel>Event promo image</InputLabel>
									</div>

									<CardMedia
										className={classes.promoImage}
										image="https://picsum.photos/300/300/?random&blur"
										title={"Artist"}
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<SelectGroup
										value={status}
										items={{ buy: "Buy" }}
										error={errors.status}
										name={"status"}
										missingItemsLabel={"No available status"}
										label={"Event status"}
										onChange={e => {
											const status = e.target.value;
											this.setState({ status });
										}}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>

								{/* TODO remove this if you're an admin or if the OrgOwner only owns one organization. Then we assume the org ID */}
								<Grid item xs={12} sm={6} lg={6}>
									{!eventId ? this.renderOrganizations() : null}
								</Grid>

								<FormSubHeading>Ticketing (Coming soon)</FormSubHeading>

								<Grid item xs={12} sm={12} lg={12} style={{ marginTop: 40 }}>
									<Button
										disabled={isSubmitting}
										type="submit"
										style={{ marginRight: 10 }}
										customClassName="callToAction"
									>
										{isSubmitting
											? eventId
												? "Creating..."
												: "Updating..."
											: eventId
												? "Update"
												: "Create"}
									</Button>
								</Grid>
							</Grid>
						</CardContent>
					</form>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Event);
