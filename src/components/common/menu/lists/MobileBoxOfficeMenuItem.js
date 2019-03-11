import React from "react";
import { observer } from "mobx-react";

import MenuItem from "../../../elements/menu/MenuItem";
import { Hidden } from "@material-ui/core";
import layout from "../../../../stores/layout";
import user from "../../../../stores/user";

const MobileBoxOfficeMenuItem = observer(props => {
	const { isBoxOffice } = layout;

	//Check they have access to box office
	if (!layout.allowedBoxOffice) {
		return null;
	}

	let studioLink = "/admin/events";
	let boxOfficeSubRoute = "sell";
	if (user.isOnlyDoorPerson) {
		boxOfficeSubRoute = "guests";
	}

	if (user.isOnlyDoorPersonOrBoxOffice) {
		studioLink = "/";
	}

	return (
		<Hidden mdUp>
			<MenuItem
				to={isBoxOffice ? studioLink : `/box-office/${boxOfficeSubRoute}`}
				shortLayout
				iconName="tickets"
				{...props}
			>
				{isBoxOffice ? "Studio" : "Box office"}
			</MenuItem>
		</Hidden>
	);
});

export default MobileBoxOfficeMenuItem;
