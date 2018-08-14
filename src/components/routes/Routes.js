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
import AdminOrganizationsList from "../pages/admin/organizations/List";
import AdminOrganization from "../pages/admin/organizations/Organization";
import AdminVenuesList from "../pages/admin/venues/List";
import AdminVenue from "../pages/admin/venues/Venue";
import AdminEventsList from "../pages/admin/events/List";
import AdminEvent from "../pages/admin/events/Event";

import user from "../../stores/user";

class Routes extends Component {
	componentDidMount() {
		//Load the google API here because we need the a .env var
		if (!process.env.REACT_APP_GOOGLE_PLACES_API_KEY) {
			if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
				console.warn(
					"Please add a REACT_APP_GOOGLE_PLACES_API_KEY value to use google places"
				);
			}
		} else {
			const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
			const script = document.createElement("script");

			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
			document.head.append(script);
		}

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
							component={AdminOrganizationsList}
						/>
						<Route
							exact
							path="/admin/organizations/create"
							component={AdminOrganization}
						/>
						<Route
							exact
							path="/admin/organizations/:id"
							component={AdminOrganization}
						/>
						<Route exact path="/admin/venues" component={AdminVenuesList} />
						<Route exact path="/admin/venues/create" component={AdminVenue} />
						<Route exact path="/admin/venues/:id" component={AdminVenue} />

						<Route exact path="/admin/events" component={AdminEventsList} />
						<Route exact path="/admin/events/create" component={AdminEvent} />
						<Route exact path="/admin/events/:id" component={AdminEvent} />

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
