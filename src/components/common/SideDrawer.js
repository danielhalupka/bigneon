import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
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
	onClick = null,
	expandIcon = null
}) => {
	const listItem = (
		<ListItem button onClick={onClick}>
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

const SubMenuItems = ({ isExpanded, classes, items }) => {
	return (
		<Collapse in={isExpanded} timeout="auto" unmountOnExit>
			<List component="div" disablePadding>
				{Object.keys(items).map(label => (
					<Link
						key={label}
						to={items[label]}
						style={{ textDecoration: "none" }}
					>
						<ListItem button className={classes.nested}>
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

class SideDrawer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeMenuItem: null
		};
	}

	changeActiveMenu(activeMenuItem) {
		this.setState({
			activeMenuItem:
				this.state.activeMenuItem !== activeMenuItem ? activeMenuItem : null
		});
	}

	render() {
		const { classes, openMenu } = this.props;
		const { activeMenuItem } = this.state;

		return (
			<Drawer
				variant="persistent"
				open={openMenu}
				classes={{
					paper: classes.drawerPaper
				}}
			>
				<List component="nav">
					<MenuItem to="/dashboard" icon={<SendIcon />}>
						Dashboard
					</MenuItem>

					<MenuItem
						icon={<EventsIcon />}
						onClick={() => this.changeActiveMenu("events")}
						expandIcon={
							activeMenuItem === "events" ? <ExpandLess /> : <ExpandMore />
						}
					>
						Events
					</MenuItem>

					<SubMenuItems
						isExpanded={activeMenuItem === "events"}
						classes={classes}
						items={{
							"Upcoming events": "/events/upcoming",
							"Past events": "/events/past",
							"Saved drafts": "/events/drafts"
						}}
					/>

					<MenuItem to="/reports" icon={<ChartIcon />}>
						Reports
					</MenuItem>
					<MenuItem to="/fans" icon={<FansIcon />}>
						Fans
					</MenuItem>
					<MenuItem icon={<ArtistsIcon />}>Artists</MenuItem>

					<MenuItem
						icon={<MarketingIcon />}
						onClick={() => this.changeActiveMenu("marketing")}
						expandIcon={
							activeMenuItem === "marketing" ? <ExpandLess /> : <ExpandMore />
						}
					>
						Marketing
					</MenuItem>

					<SubMenuItems
						isExpanded={activeMenuItem === "marketing"}
						classes={classes}
						items={{
							Social: "/marketing/social",
							Mobile: "/marketing/mobile",
							Email: "/marketing/email",
							Website: "/marketing/website",
							"Event API": "/marketing/event-api"
						}}
					/>

					<MenuItem icon={<OrganizationIcon />}>Organization</MenuItem>
				</List>
			</Drawer>
		);
	}
}

SideDrawer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SideDrawer);
