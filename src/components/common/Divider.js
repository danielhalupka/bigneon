import React from "react";
import { Typography } from "@material-ui/core";

import {
	textColorPrimary,
	textColorSecondary,
	primaryHex,
	secondaryHex
} from "../styles/theme";

export default ({ children, style = {} }) => {
	const Hr = () => (
		<hr
			style={{
				backgroundColor: "#d6d6d6",
				height: 1,
				borderRadius: 4,
				flex: 1,
				marginTop: 12
			}}
		/>
	);

	if (!children) {
		return <Hr />;
	}

	return (
		<div
			style={{
				width: "100%",
				textAlign: "center",
				flexDirection: "row",
				display: "flex",
				...style
			}}
		>
			<Hr />
			<Typography
				style={{ marginLeft: 10, marginRight: 10 }}
				variant="subheading"
				gutterBottom
			>
				{children}
			</Typography>
			<Hr />
		</div>
	);
};
