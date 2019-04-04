import React from "react";
import Typography from "@material-ui/core/Typography";
import MUIDivider from "@material-ui/core/Divider";

export default ({
	children,
	style = {},
	dashed = false,
	light = false,
	height = null,
	...rest
}) => {
	let dashedStyle = {};
	if (dashed) {
		dashedStyle = {
			borderStyle: "dashed",
			borderColor: "white"
		};
	}

	const Hr = () => (
		<MUIDivider
			light={light}
			style={{
				flex: 1,
				marginTop: 12,
				height,
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
			{...rest}
		>
			<Hr/>
			{children ? (
				<Typography
					style={{ marginLeft: 10, marginRight: 10 }}
					variant="subheading"
					gutterBottom
				>
					{children}
				</Typography>
			) : null}
			{children ? <Hr/> : null}
		</div>
	);
};
