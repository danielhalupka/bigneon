import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import { validEmail } from "../../../../../validators";
import Bigneon from "../../../../../helpers/bigneon";

import { fontFamilyDemiBold, primaryHex } from "../../../../styles/theme";
import OrgUserRow from "./OrgUserRow";

const imageSize = 40;

const styles = theme => ({
	content: {
		padding: theme.spacing.unit * 6,
		paddingLeft: theme.spacing.unit * 8,
		paddingRight: theme.spacing.unit * 8
	},
	spacer: {
		marginTop: theme.spacing.unit * 4
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.95
	},
	itemText: {
		lineHeight: 0.5
	},
	nameProfileImage: {
		display: "flex",
		alignItems: "center"
	},
	profileImageBackground: {
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "50% 50%"
	},
	missingProfileImageBackground: {
		backgroundColor: primaryHex,
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	missingProfileImage: {
		width: imageSize * 0.45,
		height: "auto"
	}
});

class Team extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			orgMembers: [],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		this.loadOrgMembers();
	}

	loadOrgMembers() {
		Bigneon()
			.organizations.users.index({ organization_id: this.props.organizationId })
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ orgMembers: data });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Could not load members"
				});
			});
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { email } = this.state;

		const errors = {};

		if (!email) {
			errors.email = "Missing organization member email address.";
		} else if (!validEmail(email)) {
			errors.email = "Invalid email address.";
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

		this.setState({ isSubmitting: true });

		const { email } = this.state;
		const { organizationId } = this.props;

		Bigneon()
			.organizations.invite.create({
				organization_id: organizationId,
				user_email: email
			})
			.then(response => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "User invited to organization.",
					variant: "success"
				});

				this.loadOrgMembers();
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Linking failed.",
					variant: "error"
				});
			});
	}

	render() {
		const { email, orgMembers, errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<div>
					<form
						noValidate
						autoComplete="off"
						onSubmit={this.onSubmit.bind(this)}
					>
						<InputGroup
							error={errors.email}
							value={email}
							name="email"
							label="Member invite email address"
							type="email"
							onChange={e => this.setState({ email: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginRight: 10 }}
							variant="callToAction"
						>
							{isSubmitting ? "Inviting..." : "Invite user"}
						</Button>
					</form>
				</div>

				<div>
					<OrgUserRow>
						<Typography className={classes.heading}>Name</Typography>
						<Typography className={classes.heading}>Email</Typography>
						<Typography className={classes.heading}>Roles</Typography>
					</OrgUserRow>
					{orgMembers.map(user => {
						const {
							id,
							first_name,
							last_name,
							email,
							is_org_owner,
							thumb_profile_pic_url
						} = user;

						return (
							<OrgUserRow key={id}>
								<div className={classes.nameProfileImage}>
									{thumb_profile_pic_url ? (
										<div
											className={classes.profileImageBackground}
											style={{
												backgroundImage: `url(${thumb_profile_pic_url})`
											}}
										/>
									) : (
										<div className={classes.missingProfileImageBackground}>
											<img
												className={classes.missingProfileImage}
												src={"/images/profile-pic-placeholder-white.png"}
												alt={`${first_name} ${last_name}`}
											/>
										</div>
									)}
									&nbsp;&nbsp;
									<Typography className={classes.itemText}>
										{first_name} {last_name}
									</Typography>
								</div>
								<Typography className={classes.itemText}>{email}</Typography>
								<Typography className={classes.itemText}>
									{is_org_owner ? "Owner" : "Member"}
								</Typography>
							</OrgUserRow>
						);
					})}
				</div>
			</div>
		);
	}
}

Team.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(Team);
