import React from "react";

export default (text = "") => {
	text = String(text || "");
	return text.split("\n").map((item, key) => {
		return <span key={key}>{item}<br/></span>;
	});
};