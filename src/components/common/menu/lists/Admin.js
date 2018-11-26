import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "../../../elements/menu/MenuItem";

const styles = theme => {
	return {};
};

const AdminList = props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
			{/* <Divider className={classes.divider} /> */}
			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="events"
				to="/admin/events"
			>
				Events
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="fan-hub"
				to="/admin/fans"
			>
				Fans
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="artists"
				to="/admin/artists"
			>
				Artists
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="chart"
				to="/admin/reports"
			>
				Reports
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="account"
				to="/admin/organizations"
			>
				Organizations
			</MenuItem>

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="venues"
				to="/admin/venues"
			>
				Venues
			</MenuItem>
		</div>
	);
};

AdminList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(AdminList);
