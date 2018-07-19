import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import withRoot from "./withRoot";
import Container from "../common/Container";
import NotFound from "../common/NotFound";
import Dashboard from "../pages/dashboard/Index";
import Signup from "../pages/authentication/Signup";
import Login from "../pages/authentication/Login";

//import user from "../../stores/User";

class Routes extends Component {
	render() {
		return (
			<Router>
				<Container>
					<Switch>
						<Route exact path="/sign-up" component={Signup} />
						<Route exact path="/login" component={Login} />
						<Route exact path="/dashboard" component={Dashboard} />
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
