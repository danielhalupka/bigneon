import React from "react";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

export default ({ children }) => (
	<Grid item xs={12} sm={12} lg={12} style={{ marginTop: 40 }}>
		<Typography variant="display1">{children}</Typography>
	</Grid>
);
