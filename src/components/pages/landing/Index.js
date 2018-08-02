import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import SearchCard from "./cards/Search";
import Results from "./cards/Results";

const styles = theme => ({
	searchGrid: {
		marginBottom: theme.spacing.unit * 4
	}
});

class Home extends Component {
	render() {
		const { classes } = this.props;

		return (
			<div>
				<Grid container spacing={24}>
					<Grid className={classes.searchGrid} item xs={12} sm={12} lg={12}>
						<SearchCard />
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<Results />
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Home);
