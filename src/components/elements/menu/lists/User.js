import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import TicketsIcon from "@material-ui/icons/Receipt";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import OrdersIcon from "@material-ui/icons/List";

import MenuItem from "../MenuItem";

const styles = theme => {
	return {};
};

const UserList = props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
			<MenuItem to="/hub" icon={<HomeIcon />} onClick={toggleDrawer}>
				Fan hub
			</MenuItem>

			<MenuItem
				to="/account"
				icon={<AccountCircleIcon />}
				onClick={toggleDrawer}
			>
				Account
			</MenuItem>

			<MenuItem to="/tickets" icon={<TicketsIcon />} onClick={toggleDrawer}>
				My tickets
			</MenuItem>

			<MenuItem to="/orders" icon={<OrdersIcon />} onClick={toggleDrawer}>
				My orders
			</MenuItem>
		</div>
	);
};

UserList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(UserList);
