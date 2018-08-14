import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";

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
			//TODO add rest of fields when it's added to the model
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
						name
						//TODO add rest of fields
					} = response.data;

					this.setState({
						name: name || ""
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

		const { name } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing artist name.";
		}

		//TODO add rest of fields

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

		const { artistId, name } = this.state;

		const artistDetails = {
			name
		};
		//TODO add rest of fields

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
		const { artistId, name, errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">
					{artistId ? "Update" : "New"} artist
				</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={10} lg={8}>
						<Card className={classes.paper}>
							<form
								noValidate
								autoComplete="off"
								onSubmit={this.onSubmit.bind(this)}
							>
								<CardContent>
									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Artist name"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</CardContent>

								<CardActions>
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
												: "Create"}
									</Button>
								</CardActions>
							</form>
						</Card>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Artist);
