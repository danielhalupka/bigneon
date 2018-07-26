import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import axios from "axios";

import InputGroup from "../../../common/form/InputGroup";
import SelectGroup from "../../../common/form/SelectGroup";

import Button from "../../../common/Button";
import user from "../../../../stores/user";
import notifications from "../../../../stores/notifications";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class OrganizationsCreate extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			userId: "", //: userId ? userId : "",
			errors: {},
			isSubmitting: false,
			orgRoleUsers: { hi: "Yo", hey: "hi" }
		};
	}

	componentDidMount() {
		//TODO load users from api when available
		//Right just loading in current user
		const orgRoleUsers = {};
		orgRoleUsers[user.id] = user.name;

		this.setState({ orgRoleUsers });
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { name, userId } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing organization name.";
		}

		if (!userId) {
			errors.userId = "Missing organization owner user.";
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

		const { name, userId } = this.state;

		const token = localStorage.getItem("token");

		axios
			.post(
				"http://0.0.0.0:9000/organizations",
				{
					name,
					owner_user_id: userId
				},
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			)
			.then(response => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Organization created",
					variant: "success"
				});

				this.props.history.push("/admin/organizations");
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Create failed.", //TODO add more details here
					variant: "error"
				});
			});
	}

	render() {
		const { name, userId, orgRoleUsers, errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">Create organization</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={6} lg={3}>
						<Card className={classes.paper}>
							<form
								noValidate
								autoComplete="off"
								onSubmit={this.onSubmit.bind(this)}
							>
								<CardContent>
									{/* <Typography gutterBottom variant="headline" component="h2">
										Details
									</Typography> */}

									<InputGroup
										error={errors.name}
										value={name}
										name="name"
										label="Organization name"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>

									{/* <InputGroup
										error={errors.userId}
										value={userId}
										name="userId"
										label="User ID (Will change to select)"
										type="text"
										onChange={e => this.setState({ userId: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/> */}

									<SelectGroup
										items={orgRoleUsers}
										value={userId}
										error={errors.userId}
										onChange={e => this.setState({ userId: e.target.value })}
										name="user"
										label="Organization owner"
									/>
								</CardContent>
								<CardActions>
									<Button
										disabled={isSubmitting}
										type="submit"
										style={{ marginRight: 10 }}
										customClassName="callToAction"
									>
										{isSubmitting ? "Creating..." : "Create"}
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

export default withStyles(styles)(OrganizationsCreate);
