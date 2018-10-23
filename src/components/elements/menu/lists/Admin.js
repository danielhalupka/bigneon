import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

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
				iconName="account"
				onClick={() => changeOpenMenu("admin-organizations")}
				expand={openMenuItem === "admin-organizations"}
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
				iconName="venues"
				onClick={() => changeOpenMenu("admin-venues")}
				expand={openMenuItem === "admin-venues"}
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
				iconName="artists"
				onClick={() => changeOpenMenu("admin-artists")}
				expand={openMenuItem === "admin-artists"}
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
				iconName="events"
				onClick={() => changeOpenMenu("admin-events")}
				expand={openMenuItem === "admin-events"}
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
