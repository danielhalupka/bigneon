import React, { Component } from "react";
import PeopleIcon from "@material-ui/icons/People";
import PropTypes from "prop-types";

import CardContainer from "./CardContainer";

class Attendance extends Component {
	constructor(props) {
		super(props);

		const { days } = props;

		this.state = {
			value: 102 * days
		};
	}

	render() {
		const { value } = this.state;
		const { days, color } = this.props;

		return (
			<CardContainer
				icon={
					<PeopleIcon
						style={{ height: 60, width: 60, color, marginRight: 20 }}
					/>
				}
				heading={value.toLocaleString()}
				subHeading={`Attendance ${days}d`}
			/>
		);
	}
}

Attendance.propTypes = {
	days: PropTypes.number.isRequired,
	color: PropTypes.string.isRequired
};

export default Attendance;
