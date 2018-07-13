import React from "react";
import { Typography } from "@material-ui/core";

//TODO make this the 404 page
export default () => {
	return (
		<div>
			<Typography variant="display3" gutterBottom>
				Page comming soon
			</Typography>
			<Typography variant="display1" gutterBottom>
				{window.location.pathname}
			</Typography>
		</div>
	);
};
