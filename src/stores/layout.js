import { observable, action, computed } from "mobx";
import user from "./user";

class Layout {
	@observable
	showSideMenu = true;

	@observable
	showFooter = false;

	@observable
	belowFooterPadding = false;

	@observable
	includeContainerPadding = true;

	@observable
	isBoxOffice = false;

	@observable
	useContainer = true;

	@observable
	showStudioLogo = true;

	@observable
	showBottomMobileCartBar = true;

	@action
	toggleSideMenu(state) {
		this.showSideMenu = state;
	}

	@action
	toggleShowFooter(state) {
		this.showFooter = state;
	}

	@action
	toggleBelowFooterPadding(state) {
		this.belowFooterPadding = state;
	}

	@action
	toggleContainerPadding(state) {
		this.includeContainerPadding = state;
	}

	@action
	toggleBoxOffice(state) {
		this.isBoxOffice = state;
	}

	@action
	toggleContainer(state) {
		this.useContainer = state;
	}

	@action
	toggleShowStudioLogo(state) {
		this.showStudioLogo = state;
	}

	@action
	toggleBottomMobileCartBar(state) {
		this.showBottomMobileCartBar = state;
	}

	@action
	toggleFloatingHelpIcon(state) {
		if (typeof zE !== "undefined") {
			if (state) {
				zE.show ? zE.show() : null;
			} else {
				zE.show ? zE.hide() : null;
			}
		}
	}

	@computed
	get adminStyleMenu() {
		if (user.isAuthenticated) {
			return (
				user.isAdmin ||
				user.isOrgOwner ||
				user.isOrgMember ||
				user.isOrgAdmin ||
				user.isOrgBoxOffice ||
				user.isOrgDoorPerson ||
				user.isPromoter ||
				user.isPromoterReadOnly
			);
		} else {
			return null;
		}
	}

	@computed
	get allowedBoxOffice() {
		if (user.isAuthenticated) {
			return user.isOrgBoxOffice || user.isOrgDoorPerson;
		} else {
			return null;
		}
	}
}

const layout = new Layout();

export default layout;
