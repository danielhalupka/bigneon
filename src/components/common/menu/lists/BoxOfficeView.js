import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "../../../elements/menu/MenuItem";
import { observer } from "mobx-react";
import user from "../../../../stores/user";
import MobileBoxOfficeMenuItem from "./MobileBoxOfficeMenuItem";

const styles = theme => {
	return {};
};

const BoxOfficeList = observer(props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu } = props;

	return (
		<div>
			{!user.isOnlyDoorPerson ? (
				<MenuItem
					onClick={toggleDrawer}
					shortLayout
					iconName="sales"
					to="/box-office/sell"
				>
					Sell
				</MenuItem>
			) : null}

			<MenuItem
				onClick={toggleDrawer}
				shortLayout
				iconName="my-events"
				to="/box-office/guests"
			>
				Guests
			</MenuItem>

			<MobileBoxOfficeMenuItem onClick={toggleDrawer}/>
		</div>
	);
});

BoxOfficeList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(BoxOfficeList);
