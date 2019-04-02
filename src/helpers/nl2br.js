import React from "react";

export default (text = "") => {
	text = String(text || "");
	return text.split("\n").map((item, key) => {
		return <span style={{ font: "inherit" }} key={key}>{item}<br/></span>;
	});
};