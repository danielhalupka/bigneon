import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

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
import Button from "@material-ui/core/Button";

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

	render() {
		const { classes, toggleDrawer } = this.props;
		const { openMenuItem } = this.state;

		const MenuItem = ({
			to = null,
			children,
			icon,
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
								<ListItem
									button
									className={classes.nested}
									onClick={toggleDrawer}
								>
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

		return (
			<List component="nav">
				<img
					style={{ width: "100%", padding: 5 }}
					src="/images/bn-logo-text.png"
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
						<Button onClick={toggleDrawer} style={{ width: "100%" }}>
							Create new event
						</Button>
					</Link>
				</div>

				<Divider />
				<MenuItem to="/dashboard" icon={<SendIcon />}>
					Dashboard
				</MenuItem>

				<MenuItem
					icon={<EventsIcon />}
					onClick={() => this.changeOpenMenu("events")}
					expandIcon={
						openMenuItem === "events" ? <ExpandLess /> : <ExpandMore />
					}
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
					onClick={() => this.changeOpenMenu("marketing")}
					expandIcon={
						openMenuItem === "marketing" ? <ExpandLess /> : <ExpandMore />
					}
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
				/>

				<MenuItem icon={<OrganizationIcon />}>Organization</MenuItem>
			</List>
		);
	}
}

MenuContent.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired
};

export default withStyles(styles)(MenuContent);
