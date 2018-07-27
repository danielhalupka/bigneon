import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
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
import ListSubheader from "@material-ui/core/ListSubheader";

import user from "../../stores/user";
import Button from "./Button";

const drawerWidth = 260;

const styles = theme => ({
	drawerPaper: {
		position: "relative",
		width: drawerWidth
	},
	nested: {
		paddingLeft: theme.spacing.unit * 4
	}
});

const MenuItem = ({
	to = null,
	children,
	icon,
	toggleDrawer,
	onClick = null,
	expandIcon = null
}) => {
	const listItem = (
		<ListItem button onClick={onClick || toggleDrawer}>
			<ListItemIcon>{icon}</ListItemIcon>
			<ListItemText inset primary={children} />
			{expandIcon}
		</ListItem>
	);

	if (to) {
		return (
			<Link to={to} style={{ textDecoration: "none" }}>
				{listItem}
			</Link>
		);
	}

	return listItem;
};

const SubMenuItems = ({ isExpanded, classes, items, toggleDrawer }) => {
	return (
		<Collapse in={isExpanded} timeout="auto" unmountOnExit>
			<List component="div" disablePadding>
				{Object.keys(items).map(label => (
					<Link
						key={label}
						to={items[label]}
						style={{ textDecoration: "none" }}
					>
						<ListItem button className={classes.nested} onClick={toggleDrawer}>
							<ListItemIcon>
								<SubMenuIcon />
							</ListItemIcon>
							<ListItemText inset primary={label} />
						</ListItem>
					</Link>
				))}
			</List>
			<Divider />
		</Collapse>
	);
};

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

	renderAdmin() {
		const { openMenuItem } = this.state;
		const { classes, toggleDrawer } = this.props;

		return (
			<div>
				<Divider />
				<ListSubheader>System admin</ListSubheader>
				<MenuItem
					icon={<EventsIcon />}
					onClick={() => this.changeOpenMenu("admin-organizations")}
					expandIcon={
						openMenuItem === "admin-organizations" ? (
							<ExpandLess />
						) : (
							<ExpandMore />
						)
					}
					toggleDrawer={toggleDrawer}
				>
					Organizations
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "admin-organizations"}
					classes={classes}
					items={{
						All: "/admin/organizations",
						Create: "/admin/organizations/create"
					}}
					toggleDrawer={toggleDrawer}
				/>

				{/* <MenuItem
					to="/organization/create"
					icon={<OrganizationIcon />}
					toggleDrawer={toggleDrawer}
				>
					Create organization
				</MenuItem> */}
			</div>
		);
	}

	renderOrgOwnMenu() {
		const { openMenuItem } = this.state;
		const { classes, toggleDrawer } = this.props;

		return (
			<div>
				<MenuItem
					icon={<EventsIcon />}
					onClick={() => this.changeOpenMenu("events")}
					expandIcon={
						openMenuItem === "events" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Events
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "events"}
					classes={classes}
					items={{
						"Upcoming events": "/events/upcoming",
						"Past events": "/events/past",
						"Saved drafts": "/events/drafts"
					}}
					toggleDrawer={toggleDrawer}
				/>
				<MenuItem
					to="/reports"
					icon={<ChartIcon />}
					toggleDrawer={toggleDrawer}
				>
					Reports
				</MenuItem>
				<MenuItem to="/fans" icon={<FansIcon />} toggleDrawer={toggleDrawer}>
					Fans
				</MenuItem>
				<MenuItem icon={<ArtistsIcon />} toggleDrawer={toggleDrawer}>
					Artists
				</MenuItem>
				<MenuItem
					icon={<MarketingIcon />}
					onClick={() => this.changeOpenMenu("marketing")}
					expandIcon={
						openMenuItem === "marketing" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Marketing
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "marketing"}
					classes={classes}
					items={{
						Social: "/marketing/social",
						Mobile: "/marketing/mobile",
						Email: "/marketing/email",
						Website: "/marketing/website",
						"Event API": "/marketing/event-api"
					}}
					toggleDrawer={toggleDrawer}
				/>
				<MenuItem
					to="/organization"
					icon={<OrganizationIcon />}
					toggleDrawer={toggleDrawer}
				>
					Organization
				</MenuItem>
			</div>
		);
	}

	render() {
		const { isAdmin, isOrgOwner } = user;

		const { classes, toggleDrawer } = this.props;
		const { openMenuItem } = this.state;

		return (
			<List component="nav">
				<img
					style={{ width: "100%", padding: 5 }}
					src="/images/bn-logo-text.png"
					alt="Logo"
				/>
				<div
					style={{
						width: "100%",
						textAlign: "center",
						padding: 15
					}}
				>
					<Link
						to={"/events/create"}
						style={{
							textDecoration: "none"
						}}
					>
						<Button
							customClassName="callToAction"
							onClick={toggleDrawer}
							style={{ width: "100%" }}
						>
							Create new event
						</Button>
					</Link>
				</div>
				<Divider />
				<MenuItem
					to="/dashboard"
					icon={<SendIcon />}
					toggleDrawer={toggleDrawer}
				>
					Dashboard
				</MenuItem>

				{isOrgOwner ? this.renderOrgOwnMenu() : null}

				{isAdmin ? this.renderAdmin() : null}
			</List>
		);
	}
}

MenuContent.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired
};

export default withStyles(styles)(MenuContent);
