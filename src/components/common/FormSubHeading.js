import React from "react";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

export default ({ children, style = {} }) => (
	<Grid item xs={12} sm={12} lg={12} style={style}>
		<Typography variant="display1">{children}</Typography>
	</Grid>
);
