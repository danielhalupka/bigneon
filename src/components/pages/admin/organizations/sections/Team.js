import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
	withStyles
} from "@material-ui/core";
import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import { validEmail } from "../../../../../validators";
import Bigneon from "../../../../../helpers/bigneon";
import Bn from "bn-api-node";
import { fontFamilyDemiBold, primaryHex } from "../../../../styles/theme";
import OrgUserRow from "./OrgUserRow";
import SelectGroup from "../../../../common/form/SelectGroup";
import Grid from "@material-ui/core/Grid/Grid";
import user from "../../../../../stores/user";
import IconButton from "../../../../elements/IconButton";
import DialogTransition from "../../../../common/DialogTransition";

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
			role: "OrgMember",
			orgMembers: [],
			errors: {},
			isSubmitting: false,
			isDeleting: false,
			areYouSureDialogOpen: false,
			removeUserId: null
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

		const { email, role } = this.state;
		const { organizationId } = this.props;

		Bigneon()
			.organizations.invite
			.create({
				organization_id: organizationId,
				user_email: email,
				role
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

				notifications.showFromErrorResponse({
					defaultMessage: "Invite failed",
					error
				});
			});
	}

	updateUserRole(userId, role) {
		return false;
	}

	removeUser() {
		const { removeUserId } = this.state;
		const { organizationId } = this.props;

		this.setState({ isDeleting: true });
		Bigneon()
			.organizations
			.users
			.del(
				{
					organization_id: organizationId,
					user_id: removeUserId
				})
			.then(result => {
				if (result.status === 200) {
					notifications.show({
						message: "Removed user.",
						variant: "success"
					});
					this.loadOrgMembers();
				} else {
					notifications.show({
						message: "Removing user failed.",
						variant: "error"
					});
				}
				this.setState({ isDeleting: false, removeUserId: null, areYouSureDialogOpen: false });
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					defaultMessage: "Removing user failed.",
					error
				});
				this.setState({ isDeleting: false, removeUserId: null, areYouSureDialogOpen: false });
			});
	}

	onDialogClose() {
		this.setState({ removeUserId: null, areYouSureDialogOpen: false });
	}

	showRemoveDialog(removeUserId) {
		this.setState({ removeUserId, areYouSureDialogOpen: true });
	}

	get renderAreYouSureDialog() {
		const { areYouSureDialogOpen, removeUserId } = this.state;

		const onClose = this.onDialogClose.bind(this);

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				open={areYouSureDialogOpen}
				onClose={onClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<DialogTitle id="alert-dialog-title">
					Are you sure you want to remove this user from the organization?
				</DialogTitle>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						variant="warning"
						onClick={() => {
							this.removeUser(removeUserId)
						}}
						autoFocus
					>
						Remove User
					</Button>
				</DialogActions>
			</Dialog>
		);
	}

	renderRoles(role = "", userId) {
		const { classes } = this.props;
		const roles = Bn.Enums && Bn.Enums.USER_ROLES_STRING ? Bn.Enums.USER_ROLES_STRING : {};
		if (!(user.isAdmin || user.isOrgOwner || user.isOrgAdmin)) {
			return ("");
		}
		if (user.isOrgAdmin) {
			delete roles[Bn.Enums.UserRole.ORG_ADMIN];
			delete roles[Bn.Enums.UserRole.ORG_OWNER];
		}
		if (userId) {
			//TODO Remove this if to re-enable the member editing post-MVP
			return (<Typography className={classes.itemText}>{Bn.Enums.USER_ROLES_STRING[role]}</Typography>);
		}
		const { errors } = this.state;
		const label = !userId ? "New User's Role" : null;
		return (
			<SelectGroup
				value={role}
				items={roles}
				error={errors.role}
				name={"role"}
				missingItemsLabel={"No available roles"}
				label={label}
				onChange={e => {
					const role = e.target.value;
					if (!userId) {
						this.setState({ role });
					} else {
						this.updateUserRole(role, userId);
					}
				}}
			/>
		);
	}

	get renderInviteForm() {
		const { role, email, errors, isSubmitting } = this.state;
		const { classes } = this.props;
		if (!(user.isAdmin || user.isOrgOwner || user.isOrgAdmin )) {
			return (
				<Typography className={classes.heading}>Only an administrator or owner can invite new members</Typography>
			);
		}
		return (
			<div>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.onSubmit.bind(this)}
				>
					<Grid
						direction="row"
						container
					>
						<Grid item xs={12} md={6}>
							<InputGroup
								error={errors.email}
								value={email}
								name="email"
								label="Member invite email address"
								type="email"
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							{this.renderRoles(role)}
						</Grid>
					</Grid>
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
		);
	}

	render() {
		const { orgMembers, isDeleting } = this.state;
		const { classes } = this.props;

		return (
			<div>
				{this.renderAreYouSureDialog}
				{this.renderInviteForm}
				<div>
					<OrgUserRow>
						<Typography className={classes.heading}>Name</Typography>
						<Typography className={classes.heading}>Email</Typography>
						<Typography className={classes.heading}>Roles</Typography>
						<Typography className={classes.heading}>&nbsp;</Typography>
					</OrgUserRow>
					{orgMembers.map((user, i) => {
						const {
							id,
							user_id,
							first_name,
							last_name,
							email,
							is_org_owner,
							thumb_profile_pic_url,
							roles,
							invite_or_member

						} = user;
						const isInvite = invite_or_member === "invite";

						//Currently you only have 1 role in the array, as it stands this is the intended functionality
						//The roles currently stack, so there is no reason to have more than 1 role, however if that changes
						//We will need to come up with a new way of displaying the roles.
						//Get the roles as they appear in the enums for editing reasons
						const enumRoles = roles.map(role => {
							const enumRole = role.replace(" (Invited)", "");
							return enumRole;
						});
						const displayRoles = enumRoles.map(role => {
							return Bn.Enums.USER_ROLES_STRING[role] + (isInvite ? " (Invite sent)" : "");
						});

						const canRemove =
							//TODO Allow removal of invitations
							(
								!isInvite
								//Admin can do anything (except remove an invite)
								&& user.isAdmin
							)
							||
							//You cannot remove yourself
							user.id !== user_id
							//Only org owners and admins can edit these
							&& (user.isOrgOwner || user.isOrgAdmin)
							//You cannot remove an org owner unless you are another org owner
							&& (user.isOrgOwner || enumRoles.indexOf(Bn.Enums.UserRole.ORG_OWNER) === -1)
							//An org admin can only adjust levels below them
							&& (user.isOrgAdmin && enumRoles.filter(role => role === Bn.Enums.UserRole.ORG_OWNER || role === Bn.Enums.UserRole.ORG_ADMIN).length === 0)

						return (
							<OrgUserRow key={i}>
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
								{!canRemove ?
									(
										<Typography className={classes.itemText}>
											{displayRoles.join(", ")}
										</Typography>
									) :
									(this.renderRoles(enumRoles[0], user_id))}
								<Typography>
									{canRemove && !isDeleting ? (
										<IconButton onClick={() => {
											this.showRemoveDialog(user_id)
										}} iconUrl="/icons/delete-gray.svg">
											Delete
										</IconButton>
									) : (<div style={{width: "36px"}}>&nbsp;</div>)}

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
