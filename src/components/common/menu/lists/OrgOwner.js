import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "../../../elements/menu/MenuItem";
import MobileSwitchOrgMenuItem from "./MobileSwitchOrgMenuItem";

const styles = theme => {
	return {};
};

const OrgOwnerList = props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
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
				iconName="my-events"
				to="/admin/fans"
			>
				Fans
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
				iconName="megaphone"
				to="/admin/marketing"
			>
				Marketing
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
				iconName="account"
				to={"/admin/organizations/current"}
			>
				Settings
			</MenuItem>

			<MobileSwitchOrgMenuItem/>
		</div>
	);
};

OrgOwnerList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(OrgOwnerList);
