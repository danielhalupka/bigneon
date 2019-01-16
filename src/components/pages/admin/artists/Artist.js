import React, { Component } from "react";
import { withStyles, InputAdornment } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";

import InputGroup from "../../../common/form/InputGroup";
import FormSubHeading from "../../../elements/FormSubHeading";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import { validUrl } from "../../../../validators";
import cloudinaryWidget from "../../../../helpers/cloudinaryWidget";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";

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
			imageUrl: "",
			name: "",
			bio: "",
			website_url: "",
			facebook_username: "",
			instagram_username: "",
			snapchat_username: "",
			soundcloud_username: "",
			bandcamp_username: "",
			youtube_video_urls: [""],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { artistId } = this.state;

		if (artistId) {
			Bigneon()
				.artists.read({ id: artistId })
				.then(response => {
					const {
						name,
						bio,
						website_url,
						facebook_username,
						instagram_username,
						snapchat_username,
						soundcloud_username,
						bandcamp_username,
						youtube_video_urls,
						image_url
					} = response.data;

					this.setState({
						name: name || "",
						bio: bio || "",
						website_url: website_url || "",
						facebook_username: facebook_username || "",
						instagram_username: instagram_username || "",
						snapchat_username: snapchat_username || "",
						soundcloud_username: soundcloud_username || "",
						bandcamp_username: bandcamp_username || "",
						youtube_video_urls: youtube_video_urls || [""],
						imageUrl: image_url || ""
					});
				})
				.catch(error => {
					console.error(error);
					this.setState({ isSubmitting: false });

					let message = "Loading artist details failed.";
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
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return null;
		}

		const {
			name,
			bio,
			website_url,
			facebook_username,
			instagram_username,
			snapchat_username,
			soundcloud_username,
			bandcamp_username,
			youtube_video_urls
		} = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing artist name.";
		}

		if (!bio) {
			errors.bio = "Missing artist bio.";
		}

		if (website_url) {
			if (!validUrl(website_url)) {
				errors.website_url = "Please enter a valid URL.";
			}
		}

		for (let index = 0; index < youtube_video_urls.length; index++) {
			const url = youtube_video_urls[index];

			if (url) {
				if (!validUrl(url)) {
					let youtubeVideosErrors = errors.youtube_video_urls
						? errors.youtube_video_urls
						: [];
					youtubeVideosErrors[index] = "Please enter a valid URL.";
					errors.youtube_video_urls = youtubeVideosErrors;
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
		Bigneon()
			.artists.create(params)
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Create artist failed.";
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

	updateArtist(id, params, onSuccess) {
		Bigneon()
			.artists.update({ ...params, id })
			.then(() => {
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Update artist failed.";
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

	uploadWidget() {
		cloudinaryWidget(
			result => {
				const imgResult = result[0];
				const { secure_url } = imgResult;
				this.setState({ imageUrl: secure_url });
			},
			error => {
				console.error(error);

				notifications.show({
					message: "Image failed to upload.",
					variant: "error"
				});
			},
			["artist-images"],
			{
				cropping: true,
				cropping_coordinates_mode: "custom",
				cropping_aspect_ratio: 1.0
			}
		);
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
			imageUrl,
			name,
			bio,
			website_url,
			facebook_username,
			instagram_username,
			snapchat_username,
			soundcloud_username,
			bandcamp_username,
			youtube_video_urls
		} = this.state;

		//If some fields are not set, don't send through empty strings as they'll fail validation
		const cleanParam = value => {
			return value === "" ? undefined : value;
		};

		const artistDetails = {
			image_url: cleanParam(imageUrl),
			thumb_image_url: cleanParam(imageUrl),
			name,
			bio,
			website_url: cleanParam(website_url),
			facebook_username: cleanParam(facebook_username),
			instagram_username: cleanParam(instagram_username),
			snapchat_username: cleanParam(snapchat_username),
			soundcloud_username: cleanParam(soundcloud_username),
			bandcamp_username: cleanParam(bandcamp_username),
			youtube_video_urls:
				youtube_video_urls.length === 1 && youtube_video_urls[0] === ""
					? undefined
					: youtube_video_urls
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
			imageUrl,
			name,
			bio,
			website_url,
			facebook_username,
			instagram_username,
			snapchat_username,
			soundcloud_username,
			bandcamp_username,
			youtube_video_urls,
			errors,
			isSubmitting
		} = this.state;
		const { classes } = this.props;

		return (
			<div>
				<PageHeading iconUrl="/icons/artists-active.svg">
					{artistId ? "Update" : "New"} artist
				</PageHeading>

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
										image={imageUrl || "/images/profile-pic-placeholder.png"}
										title={name}
									/>
									<Button
										style={{ width: "100%" }}
										onClick={this.uploadWidget.bind(this)}
									>
										Upload image
									</Button>
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

								<FormSubHeading style={{ marginTop: 40 }}>
									Social
								</FormSubHeading>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.website_url}
										value={website_url}
										name="website_url"
										label="Website"
										type="text"
										onChange={e =>
											this.setState({ website_url: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="https://artistwebsite.com/"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">@</InputAdornment>
											)
										}}
										error={errors.facebook_username}
										value={facebook_username}
										name="facebook_username"
										label="Facebook username"
										type="text"
										onChange={e =>
											this.setState({ facebook_username: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="username"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">@</InputAdornment>
											)
										}}
										error={errors.instagram_username}
										value={instagram_username}
										name="instagram_username"
										label="Instagram username"
										type="text"
										onChange={e =>
											this.setState({ instagram_username: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="username"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">@</InputAdornment>
											)
										}}
										error={errors.snapchat_username}
										value={snapchat_username}
										name="snapchat_username"
										label="Snapchat username"
										type="text"
										onChange={e =>
											this.setState({ snapchat_username: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="username"
									/>
								</Grid>

								<FormSubHeading style={{ marginTop: 40 }}>Music</FormSubHeading>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">@</InputAdornment>
											)
										}}
										error={errors.soundcloud_username}
										value={soundcloud_username}
										name="soundcloud"
										label="Soundcloud username"
										type="text"
										onChange={e =>
											this.setState({ soundcloud_username: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="username"
									/>
								</Grid>

								<Grid item xs={12} sm={6} lg={6}>
									<InputGroup
										error={errors.bandcamp_username}
										value={bandcamp_username}
										name="bandcamp_username"
										label="Bandcamp username"
										type="text"
										onChange={e =>
											this.setState({ bandcamp_username: e.target.value })
										}
										onBlur={this.validateFields.bind(this)}
										placeholder="ArtistUsername"
									/>
								</Grid>

								<FormSubHeading style={{ marginTop: 40 }}>Media</FormSubHeading>

								{youtube_video_urls.map((youtubeUrl, index) => {
									return (
										<Grid key={index} item xs={12} sm={6} lg={6}>
											<div style={{ display: "flex" }}>
												<InputGroup
													error={
														errors.youtube_video_urls
															? errors.youtube_video_urls[index]
															: null
													}
													value={youtubeUrl}
													name={`youtubeUrl-${index}`}
													label="Youtube video"
													type="text"
													onChange={e => {
														const url = e.target.value;
														this.setState(currentState => {
															currentState.youtube_video_urls[index] = url;
															return {
																youtube_video_urls:
																	currentState.youtube_video_urls
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
															currentState.youtube_video_urls.splice(index, 1);
															return {
																youtube_video_urls:
																	currentState.youtube_video_urls
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
												const newIndex = currentState.youtube_video_urls.length;
												currentState.youtube_video_urls[newIndex] = "";
												return {
													youtube_video_urls: currentState.youtube_video_urls
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
										variant="callToAction"
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
