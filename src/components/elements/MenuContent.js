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
import ListSubheader from "@material-ui/core/ListSubheader";

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

import user from "../../stores/user";
import Button from "./Button";

const styles = theme => ({
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

	renderAdminMenu() {
		const { openMenuItem } = this.state;
		const { classes, toggleDrawer } = this.props;

		return (
			<div>
				<div
					style={{
						width: "100%",
						textAlign: "center",
						padding: 15
					}}
				>
					<Link
						to={"/admin/dashboard"}
						style={{
							textDecoration: "none"
						}}
					>
						<Button
							customClassName="callToAction"
							onClick={toggleDrawer}
							style={{ width: "100%" }}
						>
							Admin dashboard
						</Button>
					</Link>
				</div>

				<Divider />
				<ListSubheader>System admin</ListSubheader>

				<MenuItem
					icon={<OrganizationIcon />}
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

				<MenuItem
					icon={<VenueIcon />}
					onClick={() => this.changeOpenMenu("admin-venues")}
					expandIcon={
						openMenuItem === "admin-venues" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Venues
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "admin-venues"}
					classes={classes}
					items={{
						All: "/admin/venues",
						Create: "/admin/venues/create"
					}}
					toggleDrawer={toggleDrawer}
				/>

				<MenuItem
					icon={<ArtistsIcon />}
					onClick={() => this.changeOpenMenu("admin-artists")}
					expandIcon={
						openMenuItem === "admin-artists" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Artists
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "admin-artists"}
					classes={classes}
					items={{
						All: "/admin/artists",
						Create: "/admin/artists/create"
					}}
					toggleDrawer={toggleDrawer}
				/>

				<MenuItem
					icon={<EventsIcon />}
					onClick={() => this.changeOpenMenu("admin-events")}
					expandIcon={
						openMenuItem === "admin-events" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Events
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "admin-events"}
					classes={classes}
					items={{
						All: "/admin/events",
						Create: "/admin/events/create"
					}}
					toggleDrawer={toggleDrawer}
				/>
			</div>
		);
	}

	renderOrgOwnMenu() {
		const { openMenuItem } = this.state;
		const { classes, toggleDrawer } = this.props;

		return (
			<div>
				<div
					style={{
						width: "100%",
						textAlign: "center",
						padding: 15
					}}
				>
					<Link
						to={"/admin/events/create"}
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
					to="/admin/dashboard"
					icon={<SendIcon />}
					toggleDrawer={toggleDrawer}
				>
					Dashboard
				</MenuItem>

				<MenuItem
					icon={<VenueIcon />}
					onClick={() => this.changeOpenMenu("admin-venues")}
					expandIcon={
						openMenuItem === "admin-venues" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Venues
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "admin-venues"}
					classes={classes}
					items={{
						All: "/admin/venues",
						Create: "/admin/venues/create"
					}}
					toggleDrawer={toggleDrawer}
				/>
				<MenuItem
					icon={<ArtistsIcon />}
					onClick={() => this.changeOpenMenu("admin-artists")}
					expandIcon={
						openMenuItem === "admin-artists" ? <ExpandLess /> : <ExpandMore />
					}
					toggleDrawer={toggleDrawer}
				>
					Artists
				</MenuItem>
				<SubMenuItems
					isExpanded={openMenuItem === "admin-artists"}
					classes={classes}
					items={{
						All: "/admin/artists",
						Create: "/admin/artists/create"
					}}
					toggleDrawer={toggleDrawer}
				/>

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
						"All events": "/admin/events",
						Create: "/admin/events/create"
					}}
					toggleDrawer={toggleDrawer}
				/>

				<MenuItem
					to="/admin/reports"
					icon={<ChartIcon />}
					toggleDrawer={toggleDrawer}
				>
					Reports
				</MenuItem>
				<MenuItem
					to="/admin/fans"
					icon={<FansIcon />}
					toggleDrawer={toggleDrawer}
				>
					Fans
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
						Social: "/admin/marketing/social",
						Mobile: "/admin/marketing/mobile",
						Email: "/admin/marketing/email",
						Website: "/admin/marketing/website",
						"Event API": "/admin/marketing/event-api"
					}}
					toggleDrawer={toggleDrawer}
				/>
				<MenuItem
					to="/admin/organizations"
					icon={<OrganizationIcon />}
					toggleDrawer={toggleDrawer}
				>
					My organizations
				</MenuItem>
			</div>
		);
	}

	renderUserMenu() {
		const { toggleDrawer } = this.props;

		return (
			<div>
				<div
					style={{
						width: "100%",
						textAlign: "center",
						padding: 15
					}}
				>
					<Link
						to={"/"}
						style={{
							textDecoration: "none"
						}}
					>
						<Button
							customClassName="callToAction"
							onClick={toggleDrawer}
							style={{ width: "100%" }}
						>
							Discover
						</Button>
					</Link>
				</div>
				<Divider />

				<MenuItem to="/hub" icon={<HomeIcon />} toggleDrawer={toggleDrawer}>
					Fan hub
				</MenuItem>

				<MenuItem
					to="/account"
					icon={<AccountCircleIcon />}
					toggleDrawer={toggleDrawer}
				>
					Account
				</MenuItem>

				<MenuItem
					to="/tickets"
					icon={<TicketsIcon />}
					toggleDrawer={toggleDrawer}
				>
					My tickets
				</MenuItem>

				<MenuItem
					to="/orders"
					icon={<OrdersIcon />}
					toggleDrawer={toggleDrawer}
				>
					My orders
				</MenuItem>

				{/* <MenuItem
					to="/events"
					icon={<EventsIcon />}
					toggleDrawer={toggleDrawer}
				>
					Events
				</MenuItem>

				<MenuItem
					to="/artists"
					icon={<ArtistsIcon />}
					toggleDrawer={toggleDrawer}
				>
					Artists
				</MenuItem>

				<MenuItem to="/venues" icon={<VenueIcon />} toggleDrawer={toggleDrawer}>
					Venues
				</MenuItem> */}
			</div>
		);
	}

	renderUnauthenticatedMenu() {
		const { openMenuItem } = this.state;
		const { classes, toggleDrawer } = this.props;

		return (
			<div>
				<div
					style={{
						width: "100%",
						textAlign: "center",
						padding: 15
					}}
				>
					<Link
						to={"/"}
						style={{
							textDecoration: "none"
						}}
					>
						<Button
							customClassName="callToAction"
							onClick={toggleDrawer}
							style={{ width: "100%" }}
						>
							Discover
						</Button>
					</Link>
				</div>
				<Divider />

				<MenuItem
					to="/events"
					icon={<EventsIcon />}
					toggleDrawer={toggleDrawer}
				>
					Events
				</MenuItem>

				<MenuItem
					to="/artists"
					icon={<ArtistsIcon />}
					toggleDrawer={toggleDrawer}
				>
					Artists
				</MenuItem>

				<MenuItem to="/venues" icon={<VenueIcon />} toggleDrawer={toggleDrawer}>
					Venues
				</MenuItem>
			</div>
		);
	}

	renderMenuItems() {
		//TODO split these menu items into their own components
		const { isAdmin, isOrgOwner, isGuest, isUser } = user;
		if (isAdmin) {
			return this.renderAdminMenu();
		}

		if (isOrgOwner) {
			return this.renderOrgOwnMenu();
		}

		if (isUser) {
			return this.renderUserMenu();
		}

		if (isGuest) {
			return this.renderUnauthenticatedMenu();
		}
	}

	render() {
		const { toggleDrawer } = this.props;

		return (
			<List component="nav">
				{/* TODO make this dynamic */}
				<div style={{ height: 80 }} />

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
