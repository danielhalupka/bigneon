import React, { Component } from "react";
import { observer } from "mobx-react";
import { withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import InputGroup from "../../common/form/InputGroup";
import Button from "../../elements/Button";
import { validEmail, validPhone } from "../../../validators";
import user from "../../../stores/user";
import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";
import cloudinaryWidget from "../../../helpers/cloudinaryWidget";
import PageHeading from "../../elements/PageHeading";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	image: {
		width: "100%",
		height: 300,
		borderRadius: theme.shape.borderRadius
	}
});

@observer
class Account extends Component {
	constructor(props) {
		super(props);

		this.state = {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			profilePicUrl: "",
			isSubmitting: false,
			errors: {}
		};
	}

	componentDidMount() {
		user.toggleSideMenu(true);

		//Initially load from current store
		const { firstName, lastName, email, phone, profilePicUrl } = user;
		this.setState({
			firstName,
			lastName,
			email,
			phone,
			profilePicUrl
		});

		//Then load from API for the freshest data
		user.refreshUser(({ firstName, lastName, email, phone, profilePicUrl }) =>
			this.setState({
				firstName,
				lastName,
				email,
				phone,
				profilePicUrl
			})
		);
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { firstName, lastName, email, phone } = this.state;

		const errors = {};

		if (!firstName) {
			errors.firstName = "Missing first name.";
		}

		if (!lastName) {
			errors.lastName = "Missing last name.";
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

		const { firstName, lastName, email, phone, profilePicUrl } = this.state;

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });
		Bigneon()
			.users.update({
				first_name: firstName,
				last_name: lastName,
				email,
				phone,
				profile_pic_url: profilePicUrl,
				thumb_profile_pic_url: profilePicUrl
			})
			.then(response => {
				notifications.show({ message: "Account updated.", variant: "success" });
				this.setState({ isSubmitting: false });

				//Then load from API for the freshest data
				user.refreshUser();
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Failed to update profile.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
					console.error(error.response.data);
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
				console.log(secure_url);
				this.setState({ profilePicUrl: secure_url });
			},
			error => {
				console.error(error);

				notifications.show({
					message: "Profile picture failed to upload.",
					variant: "error"
				});
			},
			["profile-pictures"]
		);
	}

	render() {
		const { classes } = this.props;

		const {
			firstName,
			lastName,
			email,
			phone,
			profilePicUrl,
			errors,
			isSubmitting
		} = this.state;

		return (
			<div>
				<PageHeading iconUrl="/icons/account-multi.svg">Account</PageHeading>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={10}>
						<Card className={classes.paper}>
							<form
								noValidate
								autoComplete="off"
								onSubmit={this.onSubmit.bind(this)}
							>
								<CardContent>
									<Grid container spacing={24}>
										<Grid item xs={12} sm={6} lg={6}>
											<InputGroup
												error={errors.firstName}
												value={firstName}
												name="firstName"
												label="First name*"
												type="text"
												onChange={e =>
													this.setState({ firstName: e.target.value })
												}
												onBlur={this.validateFields.bind(this)}
											/>
											<InputGroup
												error={errors.lastName}
												value={lastName}
												name="lastName"
												label="Last name*"
												type="text"
												onChange={e =>
													this.setState({ lastName: e.target.value })
												}
												onBlur={this.validateFields.bind(this)}
											/>
											<InputGroup
												error={errors.email}
												value={email}
												name="email"
												label="Email address*"
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
										</Grid>

										<Grid item xs={12} sm={6} lg={6}>
											<CardMedia
												className={classes.image}
												image={
													profilePicUrl || "/images/profile-pic-placeholder.png"
												}
												title={name}
											/>
											<Button
												style={{ width: "100%" }}
												onClick={this.uploadWidget.bind(this)}
											>
												Upload new image
											</Button>
										</Grid>
									</Grid>
								</CardContent>
								<CardActions>
									<Button
										disabled={isSubmitting}
										type="submit"
										style={{ minWidth: 150 }}
										variant="callToAction"
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

export default withStyles(styles)(Account);
