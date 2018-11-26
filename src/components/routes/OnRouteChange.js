import { Component } from "react";
import { withRouter } from "react-router-dom";
// import ReactGA from "react-ga";

class OnRouteChange extends Component {
	componentDidUpdate(prevProps) {
		//Every time a route is changed
		if (this.props.location !== prevProps.location) {
			//Auto scroll to top
			window.scrollTo(0, 0);

			// console.log(window.location.pathname + window.location.search);
			//Google analytics track page view
			//ReactGA.pageview(window.location.pathname + window.location.search);
		}
	}

	render() {
		return this.props.children;
	}
}

export default withRouter(OnRouteChange);
