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

class OrganizationsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			organizations: null
		};
	}

	componentDidMount() {
		api()
			.get("/organizations")
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);
				this.setState({ organizations: false });

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
	}

	renderOrganizations() {
		const { organizations } = this.state;
		const { classes } = this.props;

		if (organizations === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (organizations && organizations.length > 0) {
			return organizations.map(
				({
					id,
					owner_user_id,
					address,
					city,
					country,
					name,
					phone,
					state,
					zip
				}) => (
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
									to={`/admin/organizations/${id}`}
									style={{ textDecoration: "none" }}
								>
									<Button customClassName="primary">Edit details</Button>
								</Link>
								{/* <Link
									to={`/organizations/events/${id}`}
									style={{ textDecoration: "none" }}
								>
									<Button customClassName="secondary">Events</Button>
								</Link> */}
							</CardActions>
						</Card>
					</Grid>
				)
			);
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No organizations found</Typography>

					<Link
						to={"/admin/organizations/create"}
						style={{ textDecoration: "none" }}
					>
						<Button customClassName="callToAction">Create organization</Button>
					</Link>
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="display3">Organizations</Typography>

				<Grid container spacing={24}>
					{this.renderOrganizations()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(OrganizationsList);
