import React from "react";
import Typography from "@material-ui/core/Typography";
import PageHeading from "../elements/PageHeading";

//TODO make this the 404 page
export default () => {
	return (
		<div>
			<PageHeading>Page coming soon</PageHeading>
			<Typography variant="display1" gutterBottom>
				{window.location.pathname}
			</Typography>
		</div>
	);
};
