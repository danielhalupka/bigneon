import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Hidden from "@material-ui/core/Hidden";

//Icons
import MenuUserProfile from "./MenuUserProfile";
import user from "../../../stores/user";

import AdminMenuList from "../../common/menu/lists/Admin";
import UserMenuList from "../../common/menu/lists/User";
import OrgOwnerList from "../../common/menu/lists/OrgOwner";
import OrgMemberList from "../../common/menu/lists/OrgMember";
import PromoterList from "../../common/menu/lists/Promoter";
import GuestMenuList from "../../common/menu/lists/Guest";
import DoorPersonList from "../../common/menu/lists/DoorPerson";
import BoxOfficeList from "../../common/menu/lists/BoxOfficeView";

import layout from "../../../stores/layout";

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
		const { isBoxOffice } = layout;
		const { toggleDrawer } = this.props;
		const { openMenuItem } = this.state;

		if (isBoxOffice) {
			return (
				<BoxOfficeList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		const {
			isAdmin,
			isOrgOwner,
			isOrgMember,
			isOrgAdmin,
			isGuest,
			isUser,
			isOrgBoxOffice,
			isOrgDoorPerson,
			isPromoter,
			isPromoterReadOnly
		} = user;
		if (isAdmin) {
			return (
				<AdminMenuList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isOrgOwner || isOrgAdmin) {
			return (
				<OrgOwnerList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isOrgMember) {
			return (
				<OrgMemberList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isPromoter || isPromoterReadOnly) {
			return (
				<PromoterList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isOrgBoxOffice) {
			return (
				<BoxOfficeList
					toggleDrawer={toggleDrawer}
					openMenuItem={openMenuItem}
					changeOpenMenu={name => this.changeOpenMenu(name)}
				/>
			);
		}

		if (isOrgDoorPerson) {
			return (
				<DoorPersonList
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
					<div style={{ height: 60 }}/>
				</Hidden>

				{layout.adminStyleMenu ? null : (
					<MenuUserProfile onClick={toggleDrawer}/>
				)}

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
