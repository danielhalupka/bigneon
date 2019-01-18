import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import MenuItem from "../../../elements/menu/MenuItem";
import StatsCard from "../../../elements/menu/StatsCard";
import Button from "../../../elements/Button";
import orders from "../../../../stores/orders";
import tickets from "../../../../stores/tickets";

const styles = theme => {
	return {
		stats: {
			margin: theme.spacing.unit * 3
		},
		divider: {
			margin: theme.spacing.unit * 3
		},
		spacer: {
			marginTop: theme.spacing.unit
		},
		button: { width: "100%", marginTop: theme.spacing.unit * 2 }
	};
};

const UserList = observer(props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu, classes } = props;

	return (
		<div>
			<MenuItem to="/hub" iconName="fan-hub" onClick={toggleDrawer}>
				Fan hub
			</MenuItem>

			<MenuItem to="/account" iconName="account" onClick={toggleDrawer}>
				Account
			</MenuItem>

			<MenuItem to="/orders" iconName="chart" onClick={toggleDrawer}>
				My orders
			</MenuItem>

			<Divider className={classes.divider}/>

			<div className={classes.stats}>
				<Typography>STATISTICS</Typography>
				<div className={classes.spacer}/>

				<StatsCard
					iconUrl="/icons/artists-active.svg"
					label="Upcoming events"
					value={tickets.upcomingEventCount}
				/>

				<div className={classes.spacer}/>

				<StatsCard
					iconUrl="/icons/chart-active.svg"
					label="My orders"
					value={orders.orderCount}
				/>

				<div className={classes.spacer}/>

				<Button
					href={process.env.REACT_APP_DOWNLOAD_APP}
					target="_blank"
					iconUrl="/icons/phone-white.svg"
					className={classes.button}
					variant="callToAction"
				>
					Get the App
				</Button>
			</div>
		</div>
	);
});

UserList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(UserList);
