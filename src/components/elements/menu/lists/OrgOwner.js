import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

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
import VenueIcon from "@material-ui/icons/Room";

import MenuItem from "../MenuItem";
import Button from "../../Button";
import SubMenuItems from "../SubMenuItems";

const styles = theme => {
	return {};
};

const OrgOwnerList = props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
			<div
				style={{
					width: "100%",
					textAlign: "center",
					padding: 15
				}}
			>
				<Link to={"/admin/events/create"}>
					<Button
						variant="callToAction"
						onClick={toggleDrawer}
						style={{ width: "100%" }}
					>
						Create new event
					</Button>
				</Link>
			</div>

			{/* <Divider className={classes.divider} /> */}

			<MenuItem
				to="/admin/dashboard"
				icon={<SendIcon />}
				onClick={toggleDrawer}
			>
				Dashboard
			</MenuItem>

			<MenuItem
				icon={<VenueIcon />}
				onClick={() => this.changeOpenMenu("admin-venues")}
				expandIcon={
					openMenuItem === "admin-venues" ? <ExpandLess /> : <ExpandMore />
				}
				onClick={toggleDrawer}
			>
				Venues
			</MenuItem>
			<SubMenuItems
				isExpanded={openMenuItem === "admin-venues"}
				items={{
					All: "/admin/venues",
					Create: "/admin/venues/create"
				}}
				onClick={toggleDrawer}
			/>
			<MenuItem
				icon={<ArtistsIcon />}
				onClick={() => this.changeOpenMenu("admin-artists")}
				expandIcon={
					openMenuItem === "admin-artists" ? <ExpandLess /> : <ExpandMore />
				}
				onClick={toggleDrawer}
			>
				Artists
			</MenuItem>
			<SubMenuItems
				isExpanded={openMenuItem === "admin-artists"}
				items={{
					All: "/admin/artists",
					Create: "/admin/artists/create"
				}}
				onClick={toggleDrawer}
			/>

			<MenuItem
				icon={<EventsIcon />}
				onClick={() => this.changeOpenMenu("events")}
				expandIcon={openMenuItem === "events" ? <ExpandLess /> : <ExpandMore />}
				onClick={toggleDrawer}
			>
				Events
			</MenuItem>
			<SubMenuItems
				isExpanded={openMenuItem === "events"}
				items={{
					"All events": "/admin/events",
					Create: "/admin/events/create"
				}}
				onClick={toggleDrawer}
			/>

			<MenuItem to="/admin/reports" icon={<ChartIcon />} onClick={toggleDrawer}>
				Reports
			</MenuItem>
			<MenuItem to="/admin/fans" icon={<FansIcon />} onClick={toggleDrawer}>
				Fans
			</MenuItem>

			<MenuItem
				icon={<MarketingIcon />}
				onClick={() => this.changeOpenMenu("marketing")}
				expandIcon={
					openMenuItem === "marketing" ? <ExpandLess /> : <ExpandMore />
				}
				onClick={toggleDrawer}
			>
				Marketing
			</MenuItem>
			<SubMenuItems
				isExpanded={openMenuItem === "marketing"}
				items={{
					Social: "/admin/marketing/social",
					Mobile: "/admin/marketing/mobile",
					Email: "/admin/marketing/email",
					Website: "/admin/marketing/website",
					"Event API": "/admin/marketing/event-api"
				}}
				onClick={toggleDrawer}
			/>
			<MenuItem
				to="/admin/organizations"
				icon={<OrganizationIcon />}
				onClick={toggleDrawer}
			>
				My organizations
			</MenuItem>
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
