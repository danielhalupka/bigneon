import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "../../../elements/menu/MenuItem";

const styles = theme => {
	return {};
};

const PromoterList = props => {
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
		</div>
	);
};

PromoterList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(PromoterList);
