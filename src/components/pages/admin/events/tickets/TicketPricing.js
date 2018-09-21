import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles, InputAdornment } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";

import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";

const styles = theme => ({});

class TicketPricing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: TicketPricing.Structure(props.data)
		};
	}

	static getDerivedStateFromProps(props, current_state) {
		if (current_state.data !== props.data) {
			current_state.data = props.data;
			return current_state;
		}
		return null;
	}

	setField(key, value) {
		let data = this.state.data;

		data[key] = value;
		this.setState({ data });
		this.props.onChange(data);
	}

	render() {
		const { data } = this.state;
		let { ticketId, name, startDate, endDate, value } = data;
		const { onDelete, validateFields, errors = {} } = this.props;

		return (
			<Grid container spacing={8} alignItems={"center"}>
				<Grid item xs>
					<InputGroup
						error={errors.name}
						value={name}
						name="name"
						label="Price name"
						placeholder="Early Bird / General Admission / Day Of"
						type="text"
						onChange={e => {
							this.setField("name", e.target.value);
						}}
						onBlur={validateFields}
					/>
				</Grid>
				<Grid item xs>
					<DateTimePickerGroup
						error={errors.startDate}
						value={startDate}
						name="startDate"
						label="On sale Time"
						onChange={startDate => this.setField("startDate", startDate)}
						onBlur={validateFields}
						minDate={false}
					/>
				</Grid>
				<Grid item xs>
					<DateTimePickerGroup
						error={errors.endDate}
						value={endDate}
						name="endDate"
						label="Off sale Time"
						onChange={endDate => this.setField("endDate", endDate)}
						onBlur={validateFields}
						minDate={false}
					/>
				</Grid>
				<Grid item xs>
					<InputGroup
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">$</InputAdornment>
							)
						}}
						error={errors.value}
						value={value}
						name="value"
						label="Amount"
						placeholder="50"
						type="number"
						onChange={e => {
							this.setField("value", e.target.value);
						}}
						onBlur={validateFields}
					/>
				</Grid>

				{onDelete ? (
					<Grid item xs={1}>
						<IconButton onClick={e => onDelete(data)} color="inherit">
							<DeleteIcon />
						</IconButton>
					</Grid>
				) : null}
			</Grid>
		);
	}
}

TicketPricing.Structure = (pricing = {}) => {
	const defaultPricing = {
		id: "",
		ticketId: "",
		name: "",
		startDate: "",
		endDate: "",
		value: 0
	};
	return Object.assign(defaultPricing, pricing);
};
TicketPricing.propTypes = {
	data: PropTypes.object,
	onChange: PropTypes.func,
	onDelete: PropTypes.func,
	errors: PropTypes.object,
	validateFields: PropTypes.func.isRequired
};
export default withStyles(styles)(TicketPricing);
