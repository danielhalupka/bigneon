import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles, Grid } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import Button from "../../../../common/Button";
import api from "../../../../../helpers/api";
import notifications from "../../../../../stores/notifications";
import SelectGroup from "../../../../common/form/SelectGroup";
import EventArtist from "./EventArtist";
import FormSubHeading from "../../../../common/FormSubHeading";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class ArtistsCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artists: [],
			showArtistSelect: true,
			availableArtists: null,
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
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

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });
		//TODO make api call when it's added
		setTimeout(() => {
			notifications.show({
				message: "Event artists updated.",
				variant: "success"
			});
			this.props.onNext();
		}, 1000);
	}

	addNewArtist(id) {
		this.setState(({ artists }) => {
			artists.push({ id, setTime: null });
			return { artists };
		});
	}

	renderAddNewArtist() {
		//Pass through the currently selected artist if one has been selected
		const { availableArtists } = this.state;
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
				label={"Select an artist"}
				onChange={e => {
					const artistId = e.target.value;
					this.setState({ showArtistSelect: false });
					this.addNewArtist(artistId);
				}}
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
					<CardContent>
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

							{showArtistSelect ? this.renderAddNewArtist() : null}
						</Grid>
					</CardContent>
					<CardActions>
						{!showArtistSelect ? (
							<Button
								style={{ marginRight: 10 }}
								onClick={() => this.setState({ showArtistSelect: true })}
							>
								Add another artist
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
	onNext: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(ArtistsCard);
