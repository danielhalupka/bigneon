import React, { Component } from "react";
import SalesIcon from "@material-ui/icons/CallToAction";

import CardContainer from "./CardContainer";

class Tickets extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value: 301,
			month: "July"
		};
	}

	render() {
		const { value, month } = this.state;

		return (
			<CardContainer
				icon={
					<SalesIcon
						style={{ height: 60, width: 60, color: "#FF9800", marginRight: 20 }}
					/>
				}
				heading={value.toLocaleString()}
				subHeading={`Tickets (${month})`}
			/>
		);
	}
}

export default Tickets;
