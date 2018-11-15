import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import SalesCard from "./cards/Sales";
import TicketsCard from "./cards/Tickets";
import AttendanceCard from "./cards/Attendance";
import HappeningNow from "./cards/HappeningNow";
import PageHeading from "../../elements/PageHeading";
import layout from "../../../stores/layout";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		textAlign: "center",
		color: theme.palette.text.secondary,
		whiteSpace: "nowrap",
		marginBottom: theme.spacing.unit
	}
});

class Dashboard extends Component {
	componentDidMount() {
		layout.toggleSideMenu(true);
	}

	render() {
		return (
			<div>
				<PageHeading iconUrl="/icons/account-multi.svg">Dashboard</PageHeading>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={6} lg={3}>
						<SalesCard />
					</Grid>
					<Grid item xs={12} sm={6} lg={3}>
						<TicketsCard />
					</Grid>
					<Grid item xs={12} sm={6} lg={3}>
						<AttendanceCard color="#03A9F4" days={7} />
					</Grid>
					<Grid item xs={12} sm={6} lg={3}>
						<AttendanceCard color="#01579B" days={30} />
					</Grid>
					<Grid item xs={12}>
						<HappeningNow />
					</Grid>
					{/* <Grid item xs={12}>
						<Paper className={classes.paper}>Upcoming events</Paper>
					</Grid> */}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Dashboard);
