import React, { Component } from "react";
import SalesIcon from "@material-ui/icons/AttachMoney";

import CardContainer from "./CardContainer";

class Sales extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value: 99000,
			month: "July"
		};
	}
	render() {
		const { value, month } = this.state;

		return (
			<CardContainer
				icon={
					<SalesIcon
						style={{ height: 60, width: 60, color: "#4CAF50", marginRight: 20 }}
					/>
				}
				heading={`$ ${value.toLocaleString()}`}
				subHeading={`Sales (${month})`}
			/>
		);
	}
}

export default Sales;
