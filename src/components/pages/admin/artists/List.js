import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import { Link } from "react-router-dom";

import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import Button from "../../../common/Button";

const styles = theme => ({
	paper: {},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit
	}
});

class ArtistsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artists: null
		};
	}

	componentDidMount() {
		api()
			.get("/artists")
			.then(response => {
				const { data } = response;
				this.setState({ artists: data });
			})
			.catch(error => {
				console.error(error);
				notifications.show({
					message: "Loading artists failed.",
					variant: "error"
				});
			});
	}

	renderArtists() {
		const { artists } = this.state;
		const { classes } = this.props;

		if (artists === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (artists && artists.length > 0) {
			return artists.map(artist => {
				const { id, name } = artist;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardContent className={classes.cardContent}>
								<Typography variant="display1">{name}</Typography>
								{/* <Typography variant="body1">
									{address || "*Missing address"}
								</Typography> */}
							</CardContent>

							<CardActions>
								<Link
									to={`/admin/artists/${id}`}
									style={{ textDecoration: "none" }}
								>
									<Button customClassName="primary">Edit details</Button>
								</Link>
								<Link to={`/artists/${id}`} style={{ textDecoration: "none" }}>
									<Button customClassName="secondary">View more</Button>
								</Link>
							</CardActions>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No artists yet</Typography>
					<Link to={"/admin/artists/create"} style={{ textDecoration: "none" }}>
						<Button customClassName="callToAction">Create artist</Button>
					</Link>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Artists</Typography>

				<Grid container spacing={24}>
					{this.renderArtists()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(ArtistsList);
