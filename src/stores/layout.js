import { observable, action, computed } from "mobx";
import user from "./user";

class Layout {
	@observable
	showSideMenu = true;

	@observable
	includeContainerPadding = true;

	@action
	toggleSideMenu(state) {
		this.showSideMenu = state;
	}

	@action
	toggleContainerPadding(state) {
		this.includeContainerPadding = state;
	}

	@computed
	get adminStyleMenu() {
		return user.isAdmin || user.isOrgOwner || user.isOrgMember;
	}
}

const layout = new Layout();

export default layout;
