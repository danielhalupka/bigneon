import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import axios from "axios";

import InputGroup from "../../../common/form/InputGroup";
import Button from "../../../common/Button";
import user from "../../../../stores/user";
import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class OrganizationsView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			organizations: null
		};
	}

	componentDidMount() {
		api
			.get("/organizations")
			.then(response => {
				const { data } = response;
				this.setState({ organizations: data });
			})
			.catch(error => {
				console.error(error);
				notifications.show({
					message: "Loading organizations failed.",
					variant: "error"
				});
			});
	}

	renderOrganizations() {
		const { organizations } = this.state;
		const { classes } = this.props;

		if (organizations === null) {
			return <Typography variant="body1">Loading...</Typography>;
		}

		if (organizations) {
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
							<Typography variant="display1">{name}</Typography>
						</Card>
					</Grid>
				)
			);
		}
	}

	render() {
		const { organizations } = this.state;
		const { classes } = this.props;

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

export default withStyles(styles)(OrganizationsView);
