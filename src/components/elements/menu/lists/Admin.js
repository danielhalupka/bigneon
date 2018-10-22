import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import EventsIcon from "@material-ui/icons/Event";
import ArtistsIcon from "@material-ui/icons/MusicNote";
import OrganizationIcon from "@material-ui/icons/GroupWork";
import VenueIcon from "@material-ui/icons/Room";

import Button from "../../Button";
import MenuItem from "../MenuItem";
import SubMenuItems from "../SubMenuItems";

const styles = theme => {
	return {};
};

const AdminList = props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
			<div
				style={{
					width: "100%",
					textAlign: "center",
					padding: 15,
					paddingTop: 30,
					paddingBottom: 30
				}}
			>
				<Link to={"/admin/dashboard"}>
					<Button
						variant="callToAction"
						onClick={toggleDrawer}
						style={{ width: "100%" }}
					>
						Admin dashboard
					</Button>
				</Link>
			</div>

			{/* <Divider className={classes.divider} /> */}

			<MenuItem
				icon={<OrganizationIcon />}
				onClick={() => changeOpenMenu("admin-organizations")}
				expandIcon={
					openMenuItem === "admin-organizations" ? (
						<ExpandLess />
					) : (
						<ExpandMore />
					)
				}
			>
				Organizations
			</MenuItem>
			<SubMenuItems
				isExpanded={openMenuItem === "admin-organizations"}
				items={{
					All: "/admin/organizations",
					Create: "/admin/organizations/create"
				}}
				onClick={toggleDrawer}
			/>
			<MenuItem
				icon={<VenueIcon />}
				onClick={() => changeOpenMenu("admin-venues")}
				expandIcon={
					openMenuItem === "admin-venues" ? <ExpandLess /> : <ExpandMore />
				}
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
				onClick={() => changeOpenMenu("admin-artists")}
				expandIcon={
					openMenuItem === "admin-artists" ? <ExpandLess /> : <ExpandMore />
				}
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
				onClick={() => changeOpenMenu("admin-events")}
				expandIcon={
					openMenuItem === "admin-events" ? <ExpandLess /> : <ExpandMore />
				}
			>
				Events
			</MenuItem>
			<SubMenuItems
				isExpanded={openMenuItem === "admin-events"}
				items={{
					All: "/admin/events",
					Create: "/admin/events/create"
				}}
				onClick={toggleDrawer}
			/>
		</div>
	);
};

AdminList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(AdminList);
