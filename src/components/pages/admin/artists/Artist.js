import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";

import InputGroup from "../../../common/form/InputGroup";
import FormSubHeading from "../../../common/FormSubHeading";
import Button from "../../../common/Button";
import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import { validUrl } from "../../../../validators";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	artistImage: {
		width: "100%",
		height: 300,
		borderRadius: theme.shape.borderRadius
	}
});

class Artist extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing artist
		let artistId = null;
		if (props.match && props.match.params && props.match.params.id) {
			artistId = props.match.params.id;
		}

		this.state = {
			artistId,
			name: "",
			bio: "",
			website: "",
			facebookUsername: "",
			instagramUsername: "",
			snapchatUsername: "",
			soundcloud: "",
			bandcamp: "",
			youtubeVideos: [""],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { artistId } = this.state;

		if (artistId) {
			api()
				.get(`/artists/${artistId}`)
				.then(response => {
					const {
						name,
						bio,
						website,
						facebookUsername,
						instagramUsername,
						snapchatUsername,
						soundcloud,
						bandcamp,
						youtubeVideos
						//TODO check what the fields are named when they come from the backend
					} = response.data;

					this.setState({
						name: name || "",
						bio: bio || "",
						website: website || "",
						facebookUsername: facebookUsername || "",
						instagramUsername: instagramUsername || "",
						snapchatUsername: snapchatUsername || "",
						soundcloud: soundcloud || "",
						bandcamp: bandcamp || "",
						youtubeVideos: youtubeVideos || [""]
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });
					notifications.show({
						message: "Loading artist details failed.",
						variant: "error"
					});
				});
		}
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return null;
		}

		const {
			name,
			bio,
			website,
			facebookUsername,
			instagramUsername,
			snapchatUsername,
			soundcloud,
			bandcamp,
			youtubeVideos
		} = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing artist name.";
		}

		if (!bio) {
			errors.bio = "Missing artist bio.";
		}

		if (website) {
			if (!validUrl(website)) {
				errors.website = "Please enter a valid URL.";
			}
		}

		if (soundcloud) {
			if (!validUrl(soundcloud)) {
				errors.soundcloud = "Please enter a valid URL.";
			}
		}

		if (bandcamp) {
			if (!validUrl(bandcamp)) {
				errors.bandcamp = "Please enter a valid URL.";
			}
		}

		for (let index = 0; index < youtubeVideos.length; index++) {
			const url = youtubeVideos[index];

			if (url) {
				if (!validUrl(url)) {
					let youtubeVideosErrors = errors.youtubeVideos
						? errors.youtubeVideos
						: [];
					youtubeVideosErrors[index] = "Please enter a valid URL.";
					errors.youtubeVideos = youtubeVideosErrors;
				}
			}
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	createNewArtist(params, onSuccess) {
		api()
			.post("/artists", params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Create artist failed.",
					variant: "error"
				});
			});
	}

	updateArtist(id, params, onSuccess) {
		api()
			.put(`/artists/${id}`, { ...params, id })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Update artist failed.",
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
			artistId,
			name,
			bio,
			website,
			facebookUsername,
			instagramUsername,
			snapchatUsername,
			soundcloud,
			bandcamp,
			youtubeVideos
		} = this.state;

		const artistDetails = {
			name,
			bio,
			website,
			facebookUsername,
			instagramUsername,
			snapchatUsername,
			soundcloud,
			bandcamp,
			youtubeVideos
		};

		//If we're updating an existing venue
		if (artistId) {
			this.updateArtist(artistId, artistDetails, id => {
				notifications.show({
					message: "Artist updated.",
					variant: "success"
				});

				this.props.history.push("/admin/artists");
			});

			return;
		}

		this.createNewArtist(artistDetails, id => {
			notifications.show({
				message: "Artist created.",
				variant: "success"
			});

			this.props.history.push("/admin/artists");
		});
	}

	render() {
		const {
			artistId,
			name,
			bio,
			website,
			facebookUsername,
			instagramUsername,
			snapchatUsername,
			soundcloud,
			bandcamp,
			youtubeVideos,
			errors,
			isSubmitting
		} = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">
					{artistId ? "Update" : "New"} artist
				</Typography>

				<Card className={classes.paper}>
					<form
						noValidate
						autoComplete="off"
						onSubmit={this.onSubmit.bind(this)}
					>
						<CardContent>
							<Grid container spacing={24}>
								<Grid item xs={12} sm={4} lg={4}>
									<CardMedia
										className={classes.artistImage}
										image="https://picsum.photos/300/300/?random&blur"
										title={name}
									/>
								</Grid>

								<Grid item xs={12} sm={8} lg={8}>
									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Artist"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									<InputGroup
										error={errors.bio}
										value={bio}
										name="bio"
										label="Bio"
										type="text"
										onChange={e => this.setState({ bio: e.target.value })}
										onBlur={this.validateFields.bind(this)}
										multiline
									/>
								</Grid>

								<FormSubHeading>Social</FormSubHeading>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.website}
										value={website}
										name="website"
										label="Website"
										type="text"
										onChange={e => this.setState({ website: e.target.value })}
										onBlur={this.validateFields.bind(this)}
										placeholder="https://artistwebsite.com/"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.facebookUsername}
										value={facebookUsername}
										name="facebookUsername"
										label="Facebook username"
										type="text"
										onChange={e =>
											this.setState({ facebookUsername: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="@Facebook"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.instagramUsername}
										value={instagramUsername}
										name="instagramUsername"
										label="Instagram username"
										type="text"
										onChange={e =>
											this.setState({ instagramUsername: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="@Instagram"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.snapchatUsername}
										value={snapchatUsername}
										name="snapchatUsername"
										label="Snapchat username"
										type="text"
										onChange={e =>
											this.setState({ snapchatUsername: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="@Snapchat"
									/>
								</Grid>

								<FormSubHeading>Music</FormSubHeading>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.soundcloud}
										value={soundcloud}
										name="soundcloud"
										label="Soundcloud URL"
										type="text"
										onChange={e =>
											this.setState({ soundcloud: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="https://soundcloud.com/artist"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.bandcamp}
										value={bandcamp}
										name="bandcamp"
										label="Bandcamp URL"
										type="text"
										onChange={e => this.setState({ bandcamp: e.target.value })}
										onBlur={this.validateFields.bind(this)}
										placeholder="https://artist.bandcamp.com/"
									/>
								</Grid>

								<FormSubHeading>Media</FormSubHeading>

								{youtubeVideos.map((youtubeUrl, index) => {
									return (
										<Grid key={index} item xs={12} sm={6} lg={6}>
											<div style={{ display: "flex" }}>
												<InputGroup
													error={
														errors.youtubeVideos
															? errors.youtubeVideos[index]
															: null
													}
													value={youtubeUrl}
													name={`youtubeUrl-${index}`}
													label="Youtube video"
													type="text"
													onChange={e => {
														const url = e.target.value;
														this.setState(currentState => {
															currentState.youtubeVideos[index] = url;
															return {
																youtubeVideos: currentState.youtubeVideos
															};
														});
													}}
													onBlur={this.validateFields.bind(this)}
													placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
												/>

												<IconButton
													style={{ marginTop: 20 }}
													aria-label="Remove link"
													onClick={() => {
														this.setState(currentState => {
															//Remove just that link
															currentState.youtubeVideos.splice(index, 1);
															return {
																youtubeVideos: currentState.youtubeVideos
															};
														}, this.validateFields.bind(this));
													}}
												>
													<RemoveIcon />
												</IconButton>
											</div>
										</Grid>
									);
								})}
								<Grid item xs={12} sm={12} lg={12}>
									<Button
										onClick={() => {
											this.setState(currentState => {
												const newIndex = currentState.youtubeVideos.length + 1;
												currentState.youtubeVideos[newIndex] = "";
												return {
													youtubeVideos: currentState.youtubeVideos
												};
											}, this.validateFields.bind(this));
										}}
									>
										Add another youtube video
									</Button>
								</Grid>

								<Grid item xs={12} sm={12} lg={12} style={{ marginTop: 40 }}>
									<Button
										disabled={isSubmitting}
										type="submit"
										style={{ marginRight: 10 }}
										customClassName="callToAction"
									>
										{isSubmitting
											? artistId
												? "Creating..."
												: "Updating..."
											: artistId
												? "Update"
												: "Create new artist"}
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

export default withStyles(styles)(Artist);
