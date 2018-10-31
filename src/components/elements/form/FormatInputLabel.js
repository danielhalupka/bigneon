import React from "react";

import { secondaryHex } from "../../styles/theme";

//If it ends in an asterisk, change that color of that asterisk
export default ({ children }) => {
	if (children && children.endsWith("*")) {
		return (
			<span>
				{children.substring(0, children.length - 1)}
				<span style={{ color: secondaryHex }}>*</span>
			</span>
		);
	}

	return <span>{children}</span>;
};
