import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

export default ({ children, style = {} }) => (
	<Grid item xs={12} sm={12} lg={12} style={style}>
		<Typography
			style={{ fontFamily: "TTCommons-Bold", fontSize: 30, marginBottom: 20 }}
			variant="title"
		>
			{children}
		</Typography>
	</Grid>
);
