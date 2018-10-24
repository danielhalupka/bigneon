import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "../../../elements/menu/MenuItem";
import Button from "../../../elements/Button";

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

			<MenuItem to="/events" iconName="events" onClick={toggleDrawer}>
				Events
			</MenuItem>

			<MenuItem to="/artists" iconName="artists" onClick={toggleDrawer}>
				Artists
			</MenuItem>

			<MenuItem to="/venues" iconName="venues" onClick={toggleDrawer}>
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
