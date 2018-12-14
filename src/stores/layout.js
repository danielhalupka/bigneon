import { observable, action, computed } from "mobx";
import user from "./user";

class Layout {
	@observable
	showSideMenu = true;

	@observable
	showFooter = false;

	@observable
	includeContainerPadding = true;

	@observable
	isBoxOffice = false;

	@observable
	useContainer = true;

	@action
	toggleSideMenu(state) {
		this.showSideMenu = state;
	}

	@action
	toggleShowFooter(state) {
		this.showFooter = state;
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

	@computed
	get adminStyleMenu() {
		if (user.isAuthenticated) {
			return user.isAdmin || user.isOrgOwner || user.isOrgMember || user.isOrgAdmin;
		} else {
			return null;
		}
	}
}

const layout = new Layout();

export default layout;
