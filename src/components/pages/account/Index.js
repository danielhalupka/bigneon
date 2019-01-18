import React, { Component } from "react";
import { observer } from "mobx-react";
import { withStyles, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "../../elements/Button";
import { validEmail, validPhone } from "../../../validators";
import user from "../../../stores/user";
import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";
import PageHeading from "../../elements/PageHeading";
import Card from "../../elements/Card";
import FormSubHeading from "../../elements/FormSubHeading";
import Divider from "../../common/Divider";
import ProfilePicture from "./ProfilePicture";
import InputGroup from "../../common/form/InputGroup";
import removePhoneFormatting from "../../../helpers/removePhoneFormatting";
import analytics from "../../../helpers/analytics";

const styles = theme => ({
	root: {},
	content: {
		padding: theme.spacing.unit * 8
	},
	imageContainer: {
		display: "flex",
		justifyContent: "flex-end"
	},
	image: {
		width: 180,
		height: 180,
		borderRadius: 100
	},
	imageSizeDetails: {
		color: "#9da3b4"
	},
	imageDisclaimer: {
		marginTop: theme.spacing.unit * 4,
		fontSize: theme.typography.fontSize * 0.8,
		color: "#9da3b4",
		lineHeight: 1
	},
	actionButtons: {
		display: "flex"
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
		//Then load from API for the freshest data
		this.setDefault();
	}

	setDefault() {
		//Initially load from current store
		const { firstName, lastName, email, phone, profilePicUrl } = user;
		this.setState({
			firstName,
			lastName,
			email,
			phone,
			profilePicUrl
		});

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

		const { firstName, lastName, email } = this.state;
		const phone = this.state.phone ? removePhoneFormatting(this.state.phone) : "";

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

		if (phone && !validPhone(phone)) {
			errors.phone = "Invalid mobile number.";
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

				user.refreshUser(newUserDetails => {
					analytics.identify(newUserDetails);
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Failed to update profile.",
					error
				});
			});
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
				<Card variant="form">
					<div className={classes.content}>
						<form
							noValidate
							autoComplete="off"
							onSubmit={this.onSubmit.bind(this)}
						>
							<Grid container spacing={24}>
								<Grid item xs={12} sm={12} md={7} lg={8}>
									<FormSubHeading>Profile image</FormSubHeading>
									<Typography className={classes.imageSizeDetails}>
										Recommended image size 800x800
									</Typography>

									<Typography className={classes.imageDisclaimer}>
										It's strictly prohibited to upload insulting, violent,
										pornographic or racial images.
									</Typography>
								</Grid>

								<Grid
									item
									xs={12}
									sm={12}
									md={5}
									lg={4}
									className={classes.imageContainer}
								>
									<ProfilePicture
										profilePicUrl={profilePicUrl}
										onNewUrl={newUrl =>
											this.setState({ profilePicUrl: newUrl })
										}
									/>
								</Grid>
							</Grid>

							<Divider style={{ marginTop: 40, marginBottom: 40 }}/>

							<Grid container spacing={24}>
								<Grid item xs={12} sm={12} md={12} lg={12}>
									<FormSubHeading>Personal information</FormSubHeading>
								</Grid>

								<Grid item xs={12} sm={12} md={6} lg={6}>
									<InputGroup
										error={errors.firstName}
										value={firstName}
										name="firstName"
										label="First name*"
										type="text"
										onChange={e => this.setState({ firstName: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>
								<Grid item xs={12} sm={12} md={6} lg={6}>
									<InputGroup
										error={errors.lastName}
										value={lastName}
										name="lastName"
										label="Last name*"
										type="text"
										onChange={e => this.setState({ lastName: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>
								<Grid item xs={12} sm={12} md={6} lg={6}>
									<InputGroup
										error={errors.email}
										value={email}
										name="email"
										label="Email*"
										type="text"
										onChange={e => this.setState({ email: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>
								<Grid item xs={12} sm={12} md={6} lg={6}>
									<InputGroup
										error={errors.phone}
										value={phone}
										name="phone"
										label="Phone number"
										type="phone"
										onChange={e => this.setState({ phone: e.target.value })}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>
							</Grid>

							<Divider style={{ marginTop: 40, marginBottom: 40 }}/>

							<div className={classes.actionButtons}>
								<Button
									size="large"
									disabled={isSubmitting}
									style={{ width: "100%", marginRight: 5 }}
									onClick={this.setDefault.bind(this)}
								>
									Discard
								</Button>
								<Button
									size="large"
									disabled={isSubmitting}
									type="submit"
									style={{ width: "100%", marginLeft: 5 }}
									variant="callToAction"
								>
									{isSubmitting ? "Saving..." : <span>Save</span>}
								</Button>
							</div>
						</form>
					</div>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Account);
