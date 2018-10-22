import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";

//Icons
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import SendIcon from "@material-ui/icons/Send";
import EventsIcon from "@material-ui/icons/Event";
import SubMenuIcon from "@material-ui/icons/FiberManualRecord";
import ChartIcon from "@material-ui/icons/PieChart";
import FansIcon from "@material-ui/icons/People";
import ArtistsIcon from "@material-ui/icons/MusicNote";
import MarketingIcon from "@material-ui/icons/Notifications";
import OrganizationIcon from "@material-ui/icons/GroupWork";
import HomeIcon from "@material-ui/icons/Home";
import VenueIcon from "@material-ui/icons/Room";
import TicketsIcon from "@material-ui/icons/Receipt";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import OrdersIcon from "@material-ui/icons/List";

import MenuUserProfile from "./MenuUserProfile";
import user from "../../../stores/user";
import Button from "../Button";
import MenuItem from "./MenuItem";
import SubMenuItems from "./SubMenuItems";

import AdminMenuList from "./lists/Admin";
import UserMenuList from "./lists/User";
import OrgOwnerList from "./lists/OrgOwner";
import GuestMenuList from "./lists/Guest";

const styles = theme => ({
	divider: {
		marginRight: theme.spacing.unit * 3,
		marginLeft: theme.spacing.unit * 3
	}
});

@observer
class MenuContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			openMenuItem: null
		};
	}

	changeOpenMenu(openMenuItem) {
		this.setState({
			openMenuItem:
				this.state.openMenuItem !== openMenuItem ? openMenuItem : null
		});
	}

	renderMenuItems() {
		const { toggleDrawer } = this.props;
		const { openMenuItem } = this.state;

		const { isAdmin, isOrgOwner, isGuest, isUser } = user;
		if (isAdmin) {
			return (
				<AdminMenuList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isOrgOwner) {
			return (
				<OrgOwnerList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isUser) {
			return (
				<UserMenuList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isGuest) {
			return (
				<GuestMenuList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}
	}

	render() {
		const { toggleDrawer } = this.props;

		return (
			<List component="nav">
				<Hidden smDown>
					<div style={{ height: 60 }} />
				</Hidden>

				<MenuUserProfile onClick={toggleDrawer} />

				{/* TODO Profile details go here */}
				{this.renderMenuItems()}
			</List>
		);
	}
}

MenuContent.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired
};

export default withStyles(styles)(MenuContent);
