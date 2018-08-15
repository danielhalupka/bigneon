import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";

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
			data: TicketPricing.Structure(props.data),
			errors: {}
		};
	}

	validateFields() {}

	render() {
		const { data, errors } = this.state;
		let { ticketId, name, description, startDate, endDate, value } = data;

		return (
			<Grid container spacing={8}>
				<Grid item sm={3} xs={6}>
					<InputGroup
						error={errors.name}
						value={name}
						name="name"
						label="Ticket name"
						placeholder="General Admission"
						type="text"
						onChange={e => {
							this.setField("name", e.target.value);
						}}
						onBlur={this.validateFields}
					/>{" "}
				</Grid>
				<Grid item sm={3} xs={6}>
					asd
				</Grid>
				<Grid item sm={4} xs={6}>
					asd
				</Grid>
				<Grid item sm={4} xs={6}>
					asd
				</Grid>
				<Grid item sm={4} xs={6}>
					<InputGroup
						error={errors.value}
						value={value}
						name="value"
						label="Amount"
						placeholder="500"
						type="number"
						onChange={e => {
							this.setField("value", e.target.value);
						}}
						onBlur={this.validateFields}
					/>
				</Grid>
			</Grid>
		);
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
