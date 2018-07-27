import React, { Component } from "react";
import axios from "axios";
import { observer } from "mobx-react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import InputGroup from "../../common/form/InputGroup";
import Button from "../../common/Button";
import { validEmail, validPhone } from "../../../validators";
import user from "../../../stores/user";
import notifications from "../../../stores/notifications";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

@observer
class Profile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			email: "",
			phone: "",
			isSubmitting: false,
			errors: {}
		};
	}

	componentDidMount() {
		//Initially load from current store
		this.setState({
			name: user.name,
			email: user.email,
			phone: user.phone
		});

		//Then load from API for the freshest data
		user.refreshUser(({ name, email, phone }) =>
			this.setState({
				name: user.name,
				email: user.email,
				phone: user.phone
			})
		);
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { name, email, phone } = this.state;

		const errors = {};

		if (!name) {
			errors.name = "Missing name.";
		}

		if (!email) {
			errors.email = "Missing email.";
		} else if (!validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		if (!phone) {
			errors.phone = "Missing phone number.";
		} else if (!validPhone(phone)) {
			errors.phone = "Invalid phone number.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		const { name, email, phone } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		notifications.show({ message: "API not available yet" });
		this.setState({ isSubmitting: false });
	}

	render() {
		const { classes } = this.props;

		const { name, email, phone, errors, isSubmitting } = this.state;

		return (
			<div>
				<Typography variant="display3">Profile</Typography>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={6} lg={6}>
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
										label="Name"
										type="text"
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
									<InputGroup
										error={errors.email}
										value={email}
										name="email"
										label="Email address"
										type="text"
										onChange={e => this.setState({ email: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
									<InputGroup
										error={errors.phone}
										value={phone}
										name="phone"
										label="Phone number"
										type="text"
										onChange={e => this.setState({ phone: e.target.value })}
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
										{isSubmitting ? "Updating..." : <span>Update</span>}
									</Button>
								</CardActions>
							</form>
						</Card>
					</Grid>
					<Grid item xs={12} sm={6} lg={6} />
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Profile);
