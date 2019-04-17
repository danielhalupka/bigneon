import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from "react-router-dom";
import { observer } from "mobx-react";
import { MuiPickersUtilsProvider } from "material-ui-pickers";
import asyncComponent from "../../components/AsyncComponent";

import errorReporting from "../../helpers/errorReporting";
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
const AdminOrganizationsList = asyncComponent(() =>
	import("../pages/admin/organizations/List")
);
const AdminOrganization = asyncComponent(() =>
	import("../pages/admin/organizations/Organization")
);
const AdminVenuesList = asyncComponent(() =>
	import("../pages/admin/venues/List")
);
const AdminVenue = asyncComponent(() => import("../pages/admin/venues/Venue"));
const AdminRegionsList = asyncComponent(() =>
	import("../pages/admin/regions/List")
);
const AdminArtistsList = asyncComponent(() =>
	import("../pages/admin/artists/List")
);
const AdminArtist = asyncComponent(() =>
	import("../pages/admin/artists/Artist")
);
const AdminEventsList = asyncComponent(() =>
	import("../pages/admin/events/List")
);
const AdminEventDashboardSummary = asyncComponent(() =>
	import("../pages/admin/events/dashboard/Summary")
);
const AdminEventDashboardHolds = asyncComponent(() =>
	import("../pages/admin/events/dashboard/holds/List")
);
const AdminEventDashboardCodes = asyncComponent(() =>
	import("../pages/admin/events/dashboard/codes/List")
);
const AdminEventDashboardComps = asyncComponent(() =>
	import("../pages/admin/events/dashboard/comps/List")
);
const AdminEventDashboardReports = asyncComponent(() =>
	import("../pages/admin/events/dashboard/reports/Index")
);
const AdminEventDashboardMarketing = asyncComponent(() =>
	import("../pages/admin/events/dashboard/marketing/Index")
);
const AdminEventExportGuestList = asyncComponent(() =>
	import("../pages/admin/events/dashboard/guests/Export")
);
const AdminEventDashboardExternalAccess = asyncComponent(() =>
	import("../pages/admin/events/dashboard/external/ExternalAccess")
);
const AdminEventUpdate = asyncComponent(() =>
	import("../pages/admin/events/EventUpdate")
);
const AdminFanList = asyncComponent(() => import("../pages/admin/fans/Index"));
const AdminFanDetails = asyncComponent(() =>
	import("../pages/admin/fans/FanDetails")
);
const AdminMarketing = asyncComponent(() =>
	import("../pages/admin/marketing/Index")
);
const AdminReports = asyncComponent(() =>
	import("../pages/admin/reports/Index")
);
const AdminEventRefunds = asyncComponent(() =>
	import("../pages/admin/events/dashboard/refunds/Refunds")
);
const AdminLastCall = asyncComponent(() =>
	import("../pages/admin/events/dashboard/hospitality/LastCall")
);
const AdminReportExportPDF = asyncComponent(() =>
	import("../pages/admin/reports/ExportPDF")
);

//Box office
const BoxOfficeTicketSales = asyncComponent(() =>
	import("../pages/boxoffice/sales/Index")
);

const InviteDecline = asyncComponent(() =>
	import("../pages/admin/invites/Decline")
);
const InviteAccept = asyncComponent(() =>
	import("../pages/admin/invites/Accept")
);

//Embedded widgets
import EventQR from "../widgets/EventQR";
import EmbeddedWidget from "../widgets/Embedded";

import user from "../../stores/user";
import AuthenticateCheckDialog from "../common/AuthenticateCheckDialog";
import WidgetLinkBuilder from "../widgets/LinkBuilder";
import ReceiveTransfer from "../pages/myevents/ReceiveTransfer";
import GuestList from "../pages/boxoffice/guests/Index";
import analytics from "../../helpers/analytics";

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
		//Check the user details every now and then so we know when a token has expired
		this.interval = setInterval(() => {
			user.refreshUser();
		}, 5 * 60 * 1000); //every 5min

		// Signal that js is ready for prerendering
		window.prerenderReady = true;

		const startLoadTime = window.startLoadTime;
		if (startLoadTime) {
			analytics.trackPageLoadTime(Date.now() - startLoadTime);
		}
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}

	componentDidCatch(error, errorInfo) {
		//Capturing all global react crashes
		errorReporting.captureCaughtComponentError(error, errorInfo);
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
									path="/admin/regions"
									component={AdminRegionsList}
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
									path="/admin/events/:id/dashboard/codes"
									component={AdminEventDashboardCodes}
									isAuthenticated={isAuthenticated}
								/>
								<PrivateRoute
									exact
									path="/admin/events/:id/hospitality/last-call"
									component={AdminLastCall}
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
									path="/admin/events/:id/dashboard/marketing/:type"
									component={AdminEventDashboardMarketing}
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
									path="/exports/reports"
									component={AdminReportExportPDF}
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
