import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "../../../elements/menu/MenuItem";
import Button from "../../../elements/Button";
import SubMenuItems from "../../../elements/menu/SubMenuItems";

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

			<MenuItem to="/admin/dashboard" iconName="account" onClick={toggleDrawer}>
				Dashboard
			</MenuItem>

			<MenuItem
				iconName="account"
				onClick={() => this.changeOpenMenu("admin-venues")}
				expand={openMenuItem === "admin-venues"}
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
				iconName="account"
				onClick={() => this.changeOpenMenu("admin-artists")}
				expand={openMenuItem === "admin-artists"}
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
				iconName="account"
				onClick={() => this.changeOpenMenu("events")}
				expand={openMenuItem === "events"}
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

			<MenuItem to="/admin/reports" iconName={"account"} onClick={toggleDrawer}>
				Reports
			</MenuItem>
			<MenuItem to="/admin/fans" iconName={"account"} onClick={toggleDrawer}>
				Fans
			</MenuItem>

			<MenuItem
				iconName="account"
				onClick={() => this.changeOpenMenu("marketing")}
				expand={openMenuItem === "marketing"}
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
				iconName="account"
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
