import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class TicketPricing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: TicketPricing.Structure(props.data)
		};
	}

	render() {
		let { ticketId, name, description, startDate, endDate, value } = this.state;

		return <div />;
	}
}

TicketPricing.Structure = (pricing = {}) => {
	const defaultPricing = {
		id: "",
		ticketId: "",
		name: "",
		description: "",
		startDate: "",
		endDate: "",
		value: ""
	};
	return Object.assign(defaultPricing, pricing);
};
TicketPricing.propTypes = {
	data: PropTypes.object
};
export default withStyles(styles)(TicketPricing);
