import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import withRoot from "./withRoot";
import Container from "../common/Container";
import NotFound from "../common/NotFound";
import Dashboard from "../pages/dashboard/Index";
import Profile from "../pages/profile/Index";
import Signup from "../pages/authentication/Signup";
import Login from "../pages/authentication/Login";

//Unauthenticated pages
import Home from "../pages/landing/Index";

//Admin
import AdminOrganizationsView from "../pages/admin/organizations/View";
import AdminOrganizationsUpdate from "../pages/admin/organizations/Update";
import AdminVenuesView from "../pages/admin/venues/View";
import AdminVenuesUpdate from "../pages/admin/venues/Update";
import AdminEventsView from "../pages/admin/events/View";
import AdminEventsUpdate from "../pages/admin/events/Update";

import user from "../../stores/user";

class Routes extends Component {
	componentDidMount() {
		//Load the google API here because we need the a .env var
		const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
		const script = document.createElement("script");

		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
		document.head.append(script);

		//Check the user details every now and then so we know when a token has expired
		this.interval = setInterval(() => {
			user.refreshUser();
		}, 5 * 60 * 1000); //every 5min
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}

	render() {
		return (
			<Router>
				<Container>
					<Switch>
						<Route exact path="/" component={Home} />

						<Route exact path="/sign-up" component={Signup} />
						<Route exact path="/login" component={Login} />
						<Route exact path="/dashboard" component={Dashboard} />
						<Route exact path="/profile" component={Profile} />

						{/* System admin routes TODO hide these if they don't blong */}
						<Route exact path="/admin/dashboard" component={Dashboard} />
						<Route
							exact
							path="/admin/organizations"
							component={AdminOrganizationsView}
						/>
						<Route
							exact
							path="/admin/organizations/create"
							component={AdminOrganizationsUpdate}
						/>
						<Route
							exact
							path="/admin/organizations/:id"
							component={AdminOrganizationsUpdate}
						/>
						<Route exact path="/admin/venues" component={AdminVenuesView} />
						<Route
							exact
							path="/admin/venues/create"
							component={AdminVenuesUpdate}
						/>
						<Route
							exact
							path="/admin/venues/:id"
							component={AdminVenuesUpdate}
						/>

						<Route exact path="/admin/events" component={AdminEventsView} />
						<Route
							exact
							path="/admin/events/create"
							component={AdminEventsUpdate}
						/>
						<Route
							exact
							path="/admin/events/:id"
							component={AdminEventsUpdate}
						/>

						<Route component={NotFound} />
					</Switch>
				</Container>
			</Router>
		);
	}
}

Routes.propTypes = {
	//classes: PropTypes.object.isRequired
};

export default withRoot(Routes);
