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

class VenuesList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			venues: null
		};
	}

	componentDidMount() {
		api()
			.get("/venues")
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
	}

	renderVenues() {
		const { venues } = this.state;
		const { classes } = this.props;

		if (venues === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (venues && venues.length > 0) {
			return venues.map(venue => {
				const { id, name, address, phone } = venue;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<Card className={classes.paper}>
							<CardContent className={classes.cardContent}>
								<Typography variant="display1">{name}</Typography>
								<Typography variant="body1">
									{address || "*Missing address"}
								</Typography>
							</CardContent>

							<CardActions>
								<Link
									to={`/admin/venues/${id}`}
									style={{ textDecoration: "none" }}
								>
									<Button customClassName="primary">Edit details</Button>
								</Link>
								{/* <Link
									to={`/organizations/venues/${id}`}
									style={{ textDecoration: "none" }}
								>
									<Button customClassName="secondary">Events</Button>
								</Link> */}
							</CardActions>
						</Card>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No venues yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Venues</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Link
							to={"/admin/venues/create"}
							style={{ textDecoration: "none" }}
						>
							<Button customClassName="callToAction">Create venue</Button>
						</Link>
					</Grid>

					{this.renderVenues()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(VenuesList);
