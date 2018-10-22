import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import TicketsIcon from "@material-ui/icons/Receipt";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import OrdersIcon from "@material-ui/icons/List";
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

const styles = theme => {
	return {};
};

const GuestList = props => {
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
				<Link to={"/"}>
					<Button
						variant="callToAction"
						onClick={toggleDrawer}
						style={{ width: "100%" }}
					>
						Discover
					</Button>
				</Link>
			</div>

			{/* <Divider className={classes.divider} /> */}

			<MenuItem to="/events" icon={<EventsIcon />} onClick={toggleDrawer}>
				Events
			</MenuItem>

			<MenuItem to="/artists" icon={<ArtistsIcon />} onClick={toggleDrawer}>
				Artists
			</MenuItem>

			<MenuItem to="/venues" icon={<VenueIcon />} onClick={toggleDrawer}>
				Venues
			</MenuItem>
		</div>
	);
};

GuestList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(GuestList);
