import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Hidden from "@material-ui/core/Hidden";

//Icons
import MenuUserProfile from "../../elements/menu/MenuUserProfile";
import user from "../../../stores/user";

import AdminMenuList from "./lists/Admin";
import UserMenuList from "./lists/User";
import OrgOwnerList from "./lists/OrgOwner";
import GuestMenuList from "./lists/Guest";

const styles = theme => ({});

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
