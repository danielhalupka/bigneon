import { observable, computed, action } from "mobx";

import decodeJWT from "../helpers/decodeJWT";
import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import cart from "./cart";
import orders from "./orders";
import errorReporting from "../helpers/errorReporting";

class User {
	@observable
	id = null;

	@observable
	token = null;

	@observable
	firstName = "";

	@observable
	lastName = "";

	@observable
	email = "";

	@observable
	phone = "";

	@observable
	profilePicUrl = "";

	@observable
	userRoles = [];

	@observable
	userScopes = [];

	@observable
	globalRoles = [];

	@observable
	globalScopes = [];

	@observable
	organizationRoles = {};

	@observable
	organizationScopes = {};

	@observable
	currentOrganizationId = null;

	@observable
	organizations = {};

	@observable
	showRequiresAuthDialog = false;

	@action
	refreshUser(onSuccess = null, onError = null) {
		const token = localStorage.getItem("access_token");
		if (!token) {
			onError ? onError("Missing access token") : null;
			this.onLogout();
			return;
		}

		//Every time the user is loaded, refresh the token first. This is always called on the first load.
		//There could be a better way, open to suggestions.
		this.refreshToken(
			() => {
				Bigneon()
					.users.current()
					.then(response => {
						const { data } = response;

						const {
							user: {
								id,
								first_name,
								last_name,
								email,
								phone,
								profile_pic_url
							},
							scopes, //TODO use these instead of roles
							organization_roles,
							organization_scopes, //TODO use these instead of roles
							roles
						} = data;

						const jwtData = decodeJWT(token);

						const { sub } = jwtData;

						this.token = token;
						this.id = id;
						this.firstName = first_name;
						this.lastName = last_name;
						this.email = email;
						this.phone = phone;
						this.userRoles = roles;
						this.userScopes = scopes;
						this.organizationRoles = organization_roles;
						this.organizationScopes = organization_scopes;
						this.profilePicUrl = profile_pic_url;

						this.loadAllPossibleOrgs();
						this.loadCachedOrganizationRoles();

						if (onSuccess) {
							onSuccess({
								id,
								firstName: first_name,
								lastName: last_name,
								email,
								phone,
								profilePicUrl: this.profilePicUrl
							});
						}

						cart.refreshCart();
						orders.refreshOrders();

						errorReporting.configureScope({ userId: id, roles, organization_roles, organization_scopes });
					})
					.catch(error => {
						console.error(error);
						if (onError) {
							onError ? onError(error.message) : null;
						} else {
							//TODO if we get a 401, try refresh the token and then try this all again. But don't create a recursive loop.
							//If we get a 401, assume the token expired
							if (error.response && error.response.status === 401) {
								console.log("Unauthorized, logging out.");
								notifications.show({
									message: "Session expired",
									variant: "info"
								});
								this.onLogout();
							} else {
								notifications.show({
									message: error.message,
									variant: "error"
								});
							}
						}
					});
			},
			onError ||
				(e => {
					console.error(e);
				})
		);
	}

	@action
	refreshToken(onSuccess, onError) {
		const refresh_token = localStorage.getItem("refresh_token");
		if (!refresh_token) {
			onError("Missing refresh token.");
			return;
		}

		Bigneon()
			.auth.refresh({ refresh_token })
			.then(response => {
				const { access_token, refresh_token } = response.data;
				localStorage.setItem("access_token", access_token);
				localStorage.setItem("refresh_token", refresh_token);
				onSuccess();
			})
			.catch(error => {
				console.error(error);

				if (
					error.response &&
					error.response.status &&
					error.response.status === 404
				) {
					//If it's a 404 the user is now gone
					notifications.show({
						message: "User no longer exists.",
						variant: "error"
					});
					this.onLogout();
				} else {
					this.token = false;

					onError
						? onError(error)
						: notifications.show({
							message: "Failed to refresh session.",
							variant: "error"
						  });
				}
			});
	}

	loadCachedOrganizationRoles() {
		const availableOrgIds = Object.keys(this.organizationRoles);

		const organizationId = localStorage.getItem("currentOrganizationId");
		if (organizationId && availableOrgIds.includes(organizationId)) {
			this.setCurrentOrganizationRolesAndScopes(organizationId);
		} else if (availableOrgIds.length > 0) {
			//If it doesn't exist locally assume first org
			this.setCurrentOrganizationRolesAndScopes(availableOrgIds[0]);
		} else {
			//If the don't belong to any, set to false
			this.setCurrentOrganizationRolesAndScopes(false);
		}
	}

	@action
	setCurrentOrganizationRolesAndScopes(id, reloadPage = false) {
		this.currentOrganizationId = id;

		localStorage.setItem("currentOrganizationId", id);

		//If this is being called by the user selecting their role, we need to reload the page so the content is related to that org
		if (reloadPage) {
			window.location.href = "/admin/events";
		} else {
			//Set the active roles and scopes here as we'll know what roles this user has for this org
			this.globalRoles = this.userRoles.concat(this.organizationRoles[id]);
			this.globalScopes = this.userScopes.concat(this.organizationScopes[id]);

			errorReporting.addBreadcrumb(`Set current org: ${id}`);
		}
	}

	loadAllPossibleOrgs() {
		Bigneon()
			.organizations.index()
			.then(response => {
				const { data } = response.data;
				const organizations = {};
				data.forEach(organization => {
					organizations[organization.id] = organization.name;
				});

				this.organizations = organizations;
			})
			.catch(error => {
				if (error.response && error.response.status !== 401) {
					notifications.showFromErrorResponse({
						error,
						defaultMessage: "Loading organizations failed."
					});
				}
			});
	}

	//After logout
	@action
	onLogout() {
		this.token = false;
		this.id = null;
		this.firstName = "";
		this.lastName = "";
		this.email = "";
		this.phone = "";
		this.userRoles = [];
		this.globalRoles = [];
		this.globalScopes = [];
		this.organizationRoles = {};
		this.organizationScopes = {};
		this.currentOrganizationId = null;
		this.profilePicUrl = "";
		this.organizations = {};

		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");

		//If they logged in with facebook, kill that session also
		if (window.FB) {
			window.FB.getLoginStatus(({ status }) => {
				if (status === "connected") {
					window.FB.logout(() => {});
				}
			});
		}

		errorReporting.addBreadcrumb("User logged out.");
		
		cart.emptyCart();
	}

	//Dialog is kept in Container.js ready to popup when it's needed
	@action
	showAuthRequiredDialog(onSuccess) {
		this.showRequiresAuthDialog = true;

		if (onSuccess) {
			this.onAuthDialogSuccess = onSuccess;
		}
	}

	@action
	onSuccessAuthRequiredDialog() {
		this.showRequiresAuthDialog = false;

		if (this.onAuthDialogSuccess) {
			this.onAuthDialogSuccess();
		}
	}

	@action
	hideAuthRequiredDialog() {
		this.showRequiresAuthDialog = false;
	}

	hasScope(scope) {
		return this.globalScopes.indexOf(scope) > -1;
	}

	@computed
	get isAuthenticated() {
		//If the token is set, return 'true'.
		//If it's not set yet been checked it's 'null'.
		//If it has been checked but not authed then it's 'false'
		return this.token ? !!this.token : this.token;
	}

	@computed
	get isGuest() {
		//If they haven't signed in yet
		return !this.token;
	}

	@computed
	get isUser() {
		return this.globalRoles.indexOf("User") > -1;
	}

	@computed
	get isAdmin() {
		return this.globalRoles.indexOf("Admin") > -1;
	}

	@computed
	get isOrgOwner() {
		return this.globalRoles.indexOf("OrgOwner") > -1;
	}

	@computed
	get isOrgMember() {
		return this.globalRoles.indexOf("OrgMember") > -1;
	}

	@computed
	get isOrgAdmin() {
		return this.globalRoles.indexOf("OrgAdmin") > -1;
	}

	@computed
	get isPromoterReadOnly() {
		return this.globalRoles.indexOf("PromoterReadOnly") > -1;
	}

	@computed
	get isPromoter() {
		return this.globalRoles.indexOf("Promoter") > -1 || this.isPromoterReadOnly;
	}

	@computed
	get canViewStudio() {
		return (
			this.isOrgOwner ||
			this.isOrgMember ||
			this.isAdmin ||
			this.isOrgAdmin ||
			this.isPromoter
		);
	}

	@computed
	get isOrgBoxOffice() {
		//Trickle down role permissions
		if (
			this.isAdmin ||
			this.isOrgOwner ||
			this.isOrgMember ||
			this.isOrgAdmin
		) {
			return true;
		}

		return this.globalRoles.indexOf("OrgBoxOffice") > -1;
	}

	@computed
	get isOrgDoorPerson() {
		//Trickle down role permissions
		if (
			this.isAdmin ||
			this.isOrgOwner ||
			this.isOrgMember ||
			this.isOrgAdmin ||
			this.isOrgBoxOffice
		) {
			return true;
		}

		return this.globalRoles.indexOf("DoorPerson") > -1;
	}

	@computed
	get isOnlyDoorPerson() {
		//Show limited box office options for this, pretty much guest list only
		return this.globalRoles.indexOf("DoorPerson") > -1;
	}

	@computed
	get isOnlyDoorPersonOrBoxOffice() {
		//Don't let them see the rest of studio, just box office functions
		return (
			(this.globalRoles.indexOf("DoorPerson") > -1 ||
				this.globalRoles.indexOf("OrgBoxOffice") > -1) &&
			!this.isOrgAdmin &&
			!this.isOrgMember &&
			!this.isOrgOwner &&
			!this.isAdmin
		);
	}

	@computed
	get isOrgScanner() {
		//Currently unused
		//Trickle down role permissions
		if (this.isOrgOwner || this.isOrgMember || this.isOrgAdmin) {
			return true;
		}

		return this.globalRoles.indexOf("OrgScanner") > -1;
	}

	@computed
	get hasTransactionReports() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasEventSummaryReports() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasTicketCountReports() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasEventAuditReports() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasEventSummaryAuditReports() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasOrgBoxOfficeSalesReport() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasOrgReconciliationReport() {
		if (this.isOrgAdmin || this.isOrgOwner || this.isAdmin) {
			return true;
		}

		return false;
	}

	@computed
	get hasOrgEventSettlementReport() {
		if (this.isAdmin) {
			return true;
		}

		return false;
	}
}

const user = new User();

export default user;
