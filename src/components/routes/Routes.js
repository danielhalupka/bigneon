import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from "react-router-dom";
import { observer } from "mobx-react";

import withRoot from "./withRoot";
import Container from "../common/Container";
import NotFound from "../common/NotFound";
import Dashboard from "../pages/dashboard/Index";
import Profile from "../pages/profile/Index";
import Signup from "../pages/authentication/Signup";
import Login from "../pages/authentication/Login";
import PasswordReset from "../pages/authentication/PasswordReset";

//Unauthenticated pages
import Home from "../pages/landing/Index";
import ViewEvent from "../pages/events/ViewEvent";
import CheckoutSelection from "../pages/events/CheckoutSelection";
import CheckoutConfirmation from "../pages/events/CheckoutConfirmation";
import CheckoutSuccess from "../pages/events/CheckoutSuccess";

//Admin
import AdminOrganizationsList from "../pages/admin/organizations/List";
import AdminOrganization from "../pages/admin/organizations/Organization";

import AdminVenuesList from "../pages/admin/venues/List";
import AdminVenue from "../pages/admin/venues/Venue";

import AdminArtistsList from "../pages/admin/artists/List";
import AdminArtist from "../pages/admin/artists/Artist";

import AdminEventsList from "../pages/admin/events/List";
import AdminEvent from "../pages/admin/events/Event";

import InviteDecline from "../pages/admin/invites/Decline";
import InviteAccept from "../pages/admin/invites/Accept";

import user from "../../stores/user";
import cart from "../../stores/cart";
import AuthenticateCheckDialog from "../common/AuthenticateCheckDialog";

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => {
	//If isAuthenticated is null then we're still checking the state
	return (
		<Route
			{...rest}
			render={props =>
				isAuthenticated === null ? (
					<AuthenticateCheckDialog isLoading={true} />
				) : isAuthenticated === true ? (
					<Component {...props} />
				) : (
					<Redirect to="/login" />
				)
			}
		/>
	);
};

@observer
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

		cart.refreshCart();
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}

	render() {
		const { isAuthenticated } = user;

		return (
			<Router>
				<Container>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/events" component={Home} />

						<Route exact path="/sign-up" component={Signup} />
						<Route exact path="/login" component={Login} />
						<Route exact path="/password-reset" component={PasswordReset} />
						<Route exact path="/invites/decline" component={InviteDecline} />
						<Route exact path="/invites/accept" component={InviteAccept} />

						<PrivateRoute
							exact
							path="/dashboard"
							component={Dashboard}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/profile"
							component={Profile}
							isAuthenticated={isAuthenticated}
						/>
						<Route exact path="/events/:id" component={ViewEvent} />

						<Route
							exact
							path="/events/:id/tickets"
							component={CheckoutSelection}
						/>

						<Route
							exact
							path="/events/:id/tickets/confirmation"
							component={CheckoutConfirmation}
						/>

						<Route exact path="/cart" component={CheckoutConfirmation} />

						<PrivateRoute
							exact
							path="/events/:id/tickets/success"
							component={CheckoutSuccess}
							isAuthenticated={isAuthenticated}
						/>

						{/* System admin routes TODO hide these if they don't blong */}
						<PrivateRoute
							exact
							path="/admin/dashboard"
							component={Dashboard}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/organizations"
							component={AdminOrganizationsList}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/organizations/create"
							component={AdminOrganization}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/organizations/:id"
							component={AdminOrganization}
							isAuthenticated={isAuthenticated}
						/>

						<PrivateRoute
							exact
							path="/admin/venues"
							component={AdminVenuesList}
							isAuthenticated={isAuthenticated}
						/>

						{/* <Route exact path="/admin/venues" component={AdminVenuesList} /> */}
						<PrivateRoute
							exact
							path="/admin/venues/create"
							component={AdminVenue}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/venues/:id"
							component={AdminVenue}
							isAuthenticated={isAuthenticated}
						/>

						<PrivateRoute
							exact
							path="/admin/artists"
							component={AdminArtistsList}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/artists/create"
							component={AdminArtist}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/artists/:id"
							component={AdminArtist}
							isAuthenticated={isAuthenticated}
						/>

						<PrivateRoute
							exact
							path="/admin/events"
							component={AdminEventsList}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/events/create"
							component={AdminEvent}
							isAuthenticated={isAuthenticated}
						/>
						<PrivateRoute
							exact
							path="/admin/events/:id"
							component={AdminEvent}
							isAuthenticated={isAuthenticated}
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
