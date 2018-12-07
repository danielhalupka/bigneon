import { Component } from "react";
import { withRouter } from "react-router-dom";
import layout from "../../stores/layout";

const showSideMenuRoutes = ["/admin", "/hub", "/orders", "/account"];
const showFooterRoutes = ["/events"];
const removePaddingRoutes = ["/events", "/venues"];
const removeContainerRoutes = [
	"/widget",
	"/login",
	"/sign-up",
	"/mobile_stripe_token_auth"
];

class OnRouteChange extends Component {
	componentDidMount() {
		this.setLayout();
	}

	componentDidUpdate(prevProps) {
		//Every time a route is changed
		if (this.props.location !== prevProps.location) {
			//Auto scroll to top
			window.scrollTo(0, 0);

			this.setLayout();
		}
	}

	setLayout() {
		let showSideMenu = false;
		let showFooter = false;
		let showPadding = true;
		let isBoxOffice = false;
		let useContainer = true;

		if (window.location.pathname.startsWith("/box-office")) {
			isBoxOffice = true;
			showPadding = false;
			showFooter = false;
			showSideMenu = true;
		} else {
			showSideMenuRoutes.forEach(path => {
				if (window.location.pathname.startsWith(path)) {
					showSideMenu = true;
					return;
				}
			});

			removePaddingRoutes.forEach(path => {
				if (
					window.location.pathname.startsWith(path) ||
					window.location.pathname === "/"
				) {
					showPadding = false;
					return;
				}
			});

			showFooterRoutes.forEach(path => {
				if (
					window.location.pathname.startsWith(path) ||
					window.location.pathname === "/"
				) {
					showFooter = true;
					return;
				}
			});

			removeContainerRoutes.forEach(path => {
				if (window.location.pathname.startsWith(path)) {
					useContainer = false;
					return;
				}
			});
		}

		//Set layout based on above checks
		layout.toggleSideMenu(showSideMenu);
		layout.toggleContainerPadding(showPadding);
		layout.toggleShowFooter(showFooter);
		layout.toggleBoxOffice(isBoxOffice);
		layout.toggleContainer(useContainer);
	}

	render() {
		return this.props.children;
	}
}

export default withRouter(OnRouteChange);
