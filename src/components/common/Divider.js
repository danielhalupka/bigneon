import React from "react";
import { Typography } from "@material-ui/core";

import {
	textColorPrimary,
	textColorSecondary,
	primaryHex,
	secondaryHex
} from "../styles/theme";

export default ({ children, style = {}, dashed = false }) => {
	let dashedStyle = {};
	if (dashed) {
		dashedStyle = {
			borderStyle: "dashed",
			borderColor: "white"
		};
	}

	const Hr = () => (
		<hr
			style={{
				backgroundColor: "#d6d6d6",
				height: 1,
				borderRadius: 4,
				flex: 1,
				marginTop: 12,
				...dashedStyle
			}}
		/>
	);

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
			{children ? (
				<Typography
					style={{ marginLeft: 10, marginRight: 10 }}
					variant="subheading"
					gutterBottom
				>
					{children}
				</Typography>
			) : null}
			{children ? <Hr /> : null}
		</div>
	);
};
