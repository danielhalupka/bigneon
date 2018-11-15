import { observable, action } from "mobx";

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
}

const layout = new Layout();

export default layout;
