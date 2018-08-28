import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
const styles = theme => ({});

class TicketPricing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: TicketPricing.Structure(props.data),
			errors: {}
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

	validateFields() {}

	render() {
		const { data, errors } = this.state;
		let { ticketId, name, description, startDate, endDate, value } = data;
		const { onDelete } = this.props;
		return (
			<Grid container spacing={8} alignItems={"center"}>
				<Grid item xs>
					<InputGroup
						error={errors.name}
						value={name}
						name="name"
						label="Price Point name"
						placeholder="Early Bird / General Admission / Day Of"
						type="text"
						onChange={e => {
							this.setField("name", e.target.value);
						}}
						onBlur={this.validateFields}
					/>
				</Grid>
				{/* <Grid item xs>
						<InputGroup
							error={errors.description}
							value={description}
							name="description"
							label="Price description"
							type="text"
							onChange={e => {
								this.setField("description", e.target.value);
							}}
							onBlur={this.validateFields}
						/>
					</Grid> */}

				<Grid item xs>
					<DateTimePickerGroup
						error={errors.startDate}
						value={startDate}
						name="startDate"
						label="Onsale Time"
						onChange={startDate => this.setField("startDate", startDate)}
						onBlur={this.validateFields}
						minDate={false}
					/>
				</Grid>
				<Grid item xs>
					<DateTimePickerGroup
						error={errors.endDate}
						value={endDate}
						name="endDate"
						label="Offsale Time"
						onChange={endDate => this.setField("endDate", endDate)}
						onBlur={this.validateFields}
						minDate={false}
					/>
				</Grid>
				<Grid item xs>
					<InputGroup
						error={errors.value}
						value={value}
						name="value"
						label="Amount"
						placeholder="50"
						type="number"
						onChange={e => {
							this.setField("value", e.target.value);
						}}
						onBlur={this.validateFields}
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
		description: "",
		startDate: "",
		endDate: "",
		value: 0
	};
	return Object.assign(defaultPricing, pricing);
};
TicketPricing.propTypes = {
	data: PropTypes.object,
	onChange: PropTypes.func,
	onDelete: PropTypes.func
};
export default withStyles(styles)(TicketPricing);
