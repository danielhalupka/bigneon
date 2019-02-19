import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from "react-router-dom";
import { observer } from "mobx-react";
import { MuiPickersUtilsProvider } from "material-ui-pickers";

import CustomPickerUtils from "../../helpers/customPickerUtils";
import OnRouteChange from "./OnRouteChange";
import withRoot from "./withRoot";
import Container from "../elements/Container";
import NotFound from "../common/NotFound";
import Account from "../pages/account/Index";
import OrderList from "../pages/orders/List";
import Order from "../pages/orders/Order";
import MyEvents from "../pages/myevents/Index";
import Signup from "../pages/authentication/Signup";
import Login from "../pages/authentication/Login";
import PasswordReset from "../pages/authentication/PasswordReset";

//Unauthenticated pages
import Home from "../pages/landing/Index";
import ViewEvent from "../pages/events/ViewEvent";
import ViewVenue from "../pages/venues/ViewVenue";
import CheckoutSelection from "../pages/events/CheckoutSelection";
import CheckoutConfirmation from "../pages/events/CheckoutConfirmation";
import CheckoutSuccess from "../pages/events/CheckoutSuccess";
import MobileStripeAuth from "../pages/authentication/MobileStripeAuth";

// Development
import ElementShowcase from "../pages/development/ElementShowCase";

//Admin
import AdminOrganizationsList from "../pages/admin/organizations/List";
import AdminOrganization from "../pages/admin/organizations/Organization";
import AdminVenuesList from "../pages/admin/venues/List";
import AdminVenue from "../pages/admin/venues/Venue";
import AdminArtistsList from "../pages/admin/artists/List";
import AdminArtist from "../pages/admin/artists/Artist";
import AdminEventsList from "../pages/admin/events/List";
import AdminEventDashboardSummary from "../pages/admin/events/dashboard/Summary";
import AdminEventDashboardHolds from "../pages/admin/events/dashboard/holds/List";
import AdminEventDashboardComps from "../pages/admin/events/dashboard/comps/List";
import AdminEventDashboardReports from "../pages/admin/events/dashboard/reports/Index";
import AdminEventExportGuestList from "../pages/admin/events/dashboard/guests/Export";
import AdminEventDashboardExternalAccess from "../pages/admin/events/dashboard/external/ExternalAccess";
import AdminEventUpdate from "../pages/admin/events/EventUpdate";
import AdminFanList from "../pages/admin/fans/Index";
import AdminFanDetails from "../pages/admin/fans/FanDetails";
import AdminMarketing from "../pages/admin/marketing/Index";
import AdminReports from "../pages/admin/reports/Index";
import AdminEventRefunds from "../pages/admin/events/dashboard/refunds/Refunds";

//Box office
import BoxOfficeTicketSales from "../pages/boxoffice/sales/Index";

import InviteDecline from "../pages/admin/invites/Decline";
import InviteAccept from "../pages/admin/invites/Accept";

//Embedded widgets
import EventQR from "../widgets/EventQR";
import EmbeddedWidget from "../widgets/Embedded";

import user from "../../stores/user";
import AuthenticateCheckDialog from "../common/AuthenticateCheckDialog";
import WidgetLinkBuilder from "../widgets/LinkBuilder";
import ReceiveTransfer from "../pages/myevents/ReceiveTransfer";
import GuestList from "../pages/boxoffice/guests/Index";

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => {
	//If isAuthenticated is null then we're still checking the state
	return (
		<Route
			{...rest}
			render={props =>
				isAuthenticated === null ? (
					<AuthenticateCheckDialog isLoading={true}/>
				) : isAuthenticated === true ? (
					<Component {...props}/>
				) : (
					<Redirect to="/login"/>
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

		// Signal that js is ready for prerendering
		window.prerenderReady = true;
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
				<MuiPickersUtilsProvider utils={CustomPickerUtils}>
					<Container>
						<OnRouteChange>
							<Switch>
								<Route
									exact
									path="/element-showcase"
									component={ElementShowcase}
								/>
								<Route exact path="/" component={Home}/>
								<Route exact path="/events" component={Home}/>
								<Route exact path="/sign-up" component={Signup}/>
								<Route exact path="/login" component={Login}/>
								<Route exact path="/password-reset" component={PasswordReset}/>
								<Route
									exact
									path="/invites/decline"
									component={InviteDecline}
								/>
								<Route exact path="/invites/accept" component={InviteAccept}/>
								<Route
									exact
									path="/tickets/receive"
									component={ReceiveTransfer}
								/>
								<PrivateRoute
									exact
									path="/account"
									component={Account}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/my-events/:eventId?"
									component={MyEvents}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/orders"
									component={OrderList}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/orders/:id"
									component={Order}
									isAuthenticated={isAuthenticated}
								/>
								<Route exact path="/venues/:id" component={ViewVenue}/>
								<Route exact path="/events/:id" component={ViewEvent}/>
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
								{/* <Route exact path="/cart" component={CheckoutConfirmation} /> */}
								<PrivateRoute
									exact
									path="/events/:id/tickets/success"
									component={CheckoutSuccess}
									isAuthenticated={isAuthenticated}
								/>
								<Route
									exact
									path="/mobile_stripe_token_auth/:access_token/:refresh_token"
									component={MobileStripeAuth}
								/>

								{/* Admin routes */}
								<PrivateRoute
									exact
									path="/admin/fans"
									component={AdminFanList}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/fans/:id"
									component={AdminFanDetails}
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
									path="/admin/marketing"
									component={AdminMarketing}
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
									path="/admin/events/:id/dashboard"
									component={AdminEventDashboardSummary}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/dashboard/holds"
									component={AdminEventDashboardHolds}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/dashboard/comps/:holdId"
									component={AdminEventDashboardComps}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/external-access"
									component={AdminEventDashboardExternalAccess}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/dashboard/reports/:type"
									component={AdminEventDashboardReports}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/manage-orders"
									component={AdminEventRefunds}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/exports/events/:id/guests"
									component={AdminEventExportGuestList}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/create"
									component={AdminEventUpdate}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:upcomingOrPast?"
									component={AdminEventsList}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/reports/:report?"
									component={AdminReports}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/edit"
									component={AdminEventUpdate}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/widget-builder/:id"
									component={WidgetLinkBuilder}
									isAuthenticated={isAuthenticated}
								/>
								{/* Box office */}
								<PrivateRoute
									exact
									path="/box-office/sell"
									component={BoxOfficeTicketSales}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/box-office/guests"
									component={GuestList}
									isAuthenticated={isAuthenticated}
								/>

								{/* TODO these will be moved into their own Routes.js when web pack is changes to serve different compiled bundles */}
								<Route exact path="/widget/qr/:id" component={EventQR}/>
								<Route
									exact
									path="/widget/embed/:id"
									component={EmbeddedWidget}
								/>
								<Route component={NotFound}/>
							</Switch>
						</OnRouteChange>
					</Container>
				</MuiPickersUtilsProvider>
			</Router>
		);
	}
}

Routes.propTypes = {
	//classes: PropTypes.object.isRequired
};

export default withRoot(Routes);
