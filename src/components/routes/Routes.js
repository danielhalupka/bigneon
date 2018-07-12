import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import withRoot from "./withRoot";
import Container from "../common/Container";
import NotFound from "../common/NotFound";

const Dashboard = () => (
	<div>
		<Typography>Dashboard</Typography>
	</div>
);

class Routes extends Component {
	render() {
		return (
			<Router>
				<Container>
					<Switch>
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
