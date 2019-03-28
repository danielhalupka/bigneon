import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";

import InputGroup from "../../../../../common/form/InputGroup";
import Button from "../../../../../elements/Button";
import notifications from "../../../../../../stores/notifications";
import { validEmail } from "../../../../../../validators";
import Bigneon from "../../../../../../helpers/bigneon";
import Bn from "bn-api-node";
import { fontFamilyDemiBold, primaryHex } from "../../../../../styles/theme";
import UserRow from "./UserRow";
import Grid from "@material-ui/core/Grid/Grid";
import user from "../../../../../../stores/user";
import IconButton from "../../../../../elements/IconButton";
import SelectGroup from "../../../../../common/form/SelectGroup";

//Multi Select
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import InputLabel from "@material-ui/core/InputLabel";
import Dialog from "../../../../../elements/Dialog";
import Container from "../Container";

const imageSize = 40;

const ITEM_HEIGHT = 45;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250
		}
	}
};

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
	},
	formControl: {
		width: "100%",
		marginTop: theme.spacing.unit * 2
	}
});

class ExternalAccess extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			email: "",
			role: "PromoterReadOnly",
			inviteRoles: ["PromoterReadOnly"],
			members: [],
			//updatedUserRoles: {},
			errors: {},
			isSubmitting: false,
			isDeleting: false,
			areYouSureDialogOpen: false,
			isInviteRemove: false,
			removeId: null
		};
	}

	componentDidMount() {
		this.loadMembers();
	}

	loadMembers() {
		Bigneon()
			.events.users.index({ event_id: this.eventId })
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ members: data });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Could not load users"
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
			errors.email = "Missing email address.";
		} else if (!validEmail(email)) {
			errors.email = "Invalid email address.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	inviteUser(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		this.setState({ isSubmitting: true });

		const { email, inviteRoles } = this.state;
		const { eventId } = this.props;

		Bigneon()
			.events.users.invite({
				user_email: email,
				event_id: this.eventId,
				roles: inviteRoles
			})
			.then(response => {
				this.setState({
					email: "",
					inviteRoles: ["PromoterReadOnly"],
					isSubmitting: false
				});

				notifications.show({
					message: "User invited as promoter.",
					variant: "success"
				});

				this.loadMembers();
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

	// updateUserRole(userId, roles) {
	// 	const { updatedUserRoles } = this.state;
	// 	updatedUserRoles[userId] = roles;
	// 	this.setState({ updatedUserRoles });
	// }

	// storeUserRole(userId) {
	// 	const { organizationId } = this.props;
	// 	const { updatedUserRoles } = this.state;
	// 	const roles = updatedUserRoles[userId];
	// 	if (!roles) {
	// 		return;
	// 	}

	// 	Bigneon()
	// 		.organizations.users.replace({
	// 			organization_id: organizationId,
	// 			user_id: userId,
	// 			roles
	// 		})
	// 		.then(response => {
	// 			this.setState({ isSubmitting: false });

	// 			notifications.show({
	// 				message: "User roles updated.",
	// 				variant: "success"
	// 			});
	// 			delete updatedUserRoles[userId];
	// 			this.setState({ updatedUserRoles });
	// 			this.loadOrgMembers();
	// 		})
	// 		.catch(error => {
	// 			console.error(error);
	// 			this.setState({ isSubmitting: false });

	// 			notifications.showFromErrorResponse({
	// 				defaultMessage: "Updating user failed.",
	// 				error
	// 			});
	// 		});
	// }

	removeUser() {
		const { isInviteRemove, removeId } = this.state;

		this.setState({ isDeleting: true });

		if (isInviteRemove) {
			Bigneon()
				.events.users.deleteInvite({
					event_id: this.eventId,
					invite_id: removeId
				})
				.then(result => {
					if (result.status === 200) {
						notifications.show({
							message: "Removed invitation.",
							variant: "success"
						});
						this.loadMembers();
					} else {
						notifications.show({
							message: "Removing invitation failed.",
							variant: "error"
						});
					}
					this.setState({
						isDeleting: false,
						removeId: null,
						areYouSureDialogOpen: false
					});
				})
				.catch(error => {
					notifications.showFromErrorResponse({
						defaultMessage: "Removing invitation failed.",
						error
					});
					this.setState({
						isDeleting: false,
						removeId: null,
						areYouSureDialogOpen: false
					});
				});
		} else {
			Bigneon()
				.events.users.del({
					event_id: this.eventId,
					user_id: removeId
				})
				.then(result => {
					if (result.status === 200) {
						notifications.show({
							message: "Removed promoter.",
							variant: "success"
						});
						this.loadMembers();
					} else {
						notifications.show({
							message: "Removing promoter failed.",
							variant: "error"
						});
					}
					this.setState({
						isDeleting: false,
						removeId: null,
						areYouSureDialogOpen: false
					});
				})
				.catch(error => {
					notifications.showFromErrorResponse({
						defaultMessage: "Removing promoter failed.",
						error
					});
					this.setState({
						isDeleting: false,
						removeId: null,
						areYouSureDialogOpen: false
					});
				});
		}
	}

	onDialogClose() {
		this.setState({ removeId: null, areYouSureDialogOpen: false });
	}

	showRemoveDialog(isInviteRemove, removeId) {
		this.setState({ isInviteRemove, removeId, areYouSureDialogOpen: true });
	}

	get renderAreYouSureDialog() {
		const { areYouSureDialogOpen, isInviteRemove, removeId } = this.state;

		const onClose = this.onDialogClose.bind(this);
		let dialogTitle = "Are you sure you want to remove this promoter";
		dialogTitle += isInviteRemove ? "'s invitation?" : " from the event?";

		return (
			<Dialog open={areYouSureDialogOpen} onClose={onClose} title={dialogTitle}>
				<div>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						variant="warning"
						onClick={() => {
							this.removeUser();
						}}
						autoFocus
					>
						Remove Promoter
					</Button>
				</div>
			</Dialog>
		);
	}

	renderRoles(selectRoles = [], userId = "", allowMultiple = false) {
		const { classes } = this.props;
		const roles = {
			["Promoter"]: "Promoter",
			["PromoterReadOnly"]: "Promoter (Read only)"
		};
		if (!(user.isAdmin || user.isOrgOwner || user.isOrgAdmin)) {
			return "";
		}

		// const { updatedUserRoles } = this.state;
		// if (userId && updatedUserRoles.hasOwnProperty(userId)) {
		// 	selectRoles = updatedUserRoles[userId];
		// }
		const roleArray = [];
		for (const role in roles) {
			roleArray.push({ role: role, name: roles[role] });
		}
		const singleRole = selectRoles.length ? selectRoles[0] : "";
		return (
			<div>
				{allowMultiple ? (
					<FormControl className={classes.formControl}>
						<InputLabel htmlFor={userId || "invite-input"}>
							{userId ? "User Roles" : "New User Roles"}
						</InputLabel>
						<Select
							multiple
							value={selectRoles}
							onChange={e => {
								const roles = e.target.value;
								if (userId) {
									this.updateUserRole(userId, roles);
									this.storeUserRole(userId);
								} else {
									this.setState({ inviteRoles: roles });
								}
							}}
							input={<Input id={userId || "invite-input"}/>}
							renderValue={selected => {
								if (typeof selected === "string") {
									return roles[selected];
								}
								return selected.map(role => roles[role]).join(", ");
							}}
							MenuProps={MenuProps}
						>
							{roleArray.map(role => (
								<MenuItem key={role.role} value={role.role}>
									<Checkbox checked={selectRoles.indexOf(role.role) > -1}/>
									<ListItemText primary={role.name}/>
								</MenuItem>
							))}
						</Select>
					</FormControl>
				) : (
					<SelectGroup
						value={singleRole}
						items={roleArray.map(role => ({
							value: role.role,
							name: role.name
						}))}
						name={"Role"}
						missingItemsLabel={"Invalid Role"}
						label={"Role"}
						onChange={e => {
							const roles = [e.target.value];
							if (userId) {
								this.updateUserRole(userId, roles);
								this.storeUserRole(userId);
							} else {
								this.setState({ inviteRoles: roles });
							}
						}}
					/>
				)}
			</div>
		);
	}

	get renderInviteForm() {
		const { inviteRoles, email, errors, isSubmitting } = this.state;
		const { classes } = this.props;
		if (!(user.isAdmin || user.isOrgOwner || user.isOrgAdmin)) {
			return (
				<Typography className={classes.heading}>
					Only an administrator or owner can invite new users
				</Typography>
			);
		}
		return (
			<div>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.inviteUser.bind(this)}
				>
					<Grid direction="row" container>
						<Grid item xs={12} md={6}>
							<InputGroup
								error={errors.email}
								value={email}
								name="email"
								label="Promoter invite email address"
								type="email"
								onChange={e => this.setState({ email: e.target.value })}
								onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							{this.renderRoles(inviteRoles)}
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
		const { members, isDeleting } = this.state;
		const { classes } = this.props;
		const roleLookup = {
			["Promoter"]: "Promoter",
			["PromoterReadOnly"]: "Promoter (Read only)"
		};

		return (
			<Container eventId={this.eventId} subheading={"tools"} useCardContainer>
				{this.renderAreYouSureDialog}
				{this.renderInviteForm}
				<div>
					<UserRow>
						<Typography className={classes.heading}>Name</Typography>
						<Typography className={classes.heading}>Email</Typography>
						<Typography className={classes.heading}>Roles</Typography>
						<Typography className={classes.heading}>&nbsp;</Typography>
					</UserRow>
					{members.map((member, i) => {
						const {
							invite_id = "",
							user_id,
							first_name,
							last_name,
							email,
							thumb_profile_pic_url,
							roles,
							invite_or_member
						} = member;
						const isInvite = invite_or_member === "invite";
						const enumRoles = [].concat(roles);
						const displayRoles = enumRoles.map(role => {
							role = role.replace(" (Invited)", "");
							return roleLookup[role];
						});

						return (
							<UserRow key={i}>
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
									{displayRoles.join(", ")}
								</Typography>

								<Typography>
									{!isDeleting ? (
										<IconButton
											onClick={() => {
												this.showRemoveDialog(
													isInvite,
													isInvite ? invite_id : user_id
												);
											}}
											iconUrl="/icons/delete-gray.svg"
										>
											Delete
										</IconButton>
									) : (
										<span style={{ display: "block", width: "36px" }}>
											&nbsp;
										</span>
									)}
								</Typography>
							</UserRow>
						);
					})}
				</div>
			</Container>
		);
	}
}

export default withStyles(styles)(ExternalAccess);
