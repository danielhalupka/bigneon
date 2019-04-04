//Splits an address string that's comma separated into multi lines
import React from "react";

export default (address) => {
	if (!address || typeof address !== "string") {
		return null;
	}

	const lines = address.split(",");

	return lines.map((line, index) => <span key={index}>{index === 1 ? <br/> : null}{line}{index + 1 === lines.length ? "" : ","}</span>);
};
