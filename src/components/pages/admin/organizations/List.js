import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import { Link } from "react-router-dom";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";

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
		Bigneon()
			.organizations.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
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
								<Link to={`/admin/organizations/${id}`}>
									<Button variant="primary">Edit details</Button>
								</Link>
								{/* <Link
									to={`/organizations/events/${id}`}
								>
									<Button variant="secondary">Events</Button>
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
				</Grid>
			);
		}
	}

	render() {
		return (
			<div>
				<PageHeading>Organizations</PageHeading>
				<Link to={"/admin/organizations/create"}>
					<Button variant="callToAction">Create organization</Button>
				</Link>
				<br/>
				<Grid container spacing={24}>
					{this.renderOrganizations()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(OrganizationsList);
