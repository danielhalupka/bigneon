import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Results from "./cards/Results";
import Hero from "./Hero";
import eventResults from "../../../stores/eventResults";
import notifications from "../../../stores/notifications";
import Meta from "./Meta";

const styles = theme => ({});

class Home extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const url = new URL(window.location.href);
		const query = url.searchParams.get("search") || "";

		eventResults.refreshResults(
			{ query },
			() => {},
			message => {
				notifications.show({
					message,
					variant: "error"
				});
			}
		);
	}

	render() {
		const { classes } = this.props;

		return (
			<div>
				<Meta/>
				<Hero/>
				<Grid container justify="center">
					<Grid item xs={11} sm={11} lg={10}>
						<Results/>
					</Grid>
					<div style={{ marginBottom: 40 }}/>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Home);
