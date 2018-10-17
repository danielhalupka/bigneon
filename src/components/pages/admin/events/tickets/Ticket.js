import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import TicketPricing from "./TicketPricing";

const styles = theme => ({
	flex: {
		flexGrow: 1
	}
});

class Ticket extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: Ticket.Structure(props.data)
			//errors: {}
		};
	}

	setField(key, value) {
		let data = this.state.data;

		data[key] = value;
		this.setState({ data });
		this.props.onChange(data);
	}

	static getDerivedStateFromProps(props, state) {
		if (state.data !== props.data) {
			state.data = props.data;
			return state;
		}
		return null;
	}

	componentDidMount() {
		if (!this.state.data.pricing.length) {
			this.addPricing();
		}
	}

	addPricing() {
		let { data } = this.state;
		let { pricing, startDate, endDate } = data;
		pricing.push(
			TicketPricing.Structure({
				startDate,
				endDate
			})
		);
		this.setState({ data });
	}

	renderTicketPricing() {
		const { errors, validateFields } = this.props;
		const pricingErrors = errors && errors.pricing ? errors.pricing : {};

		let ticketPricings = [];
		this.state.data.pricing.forEach((pricing, index) => {
			ticketPricings.push(
				<Grid item xs={12} key={`ticket_pricing_${index}`}>
					<TicketPricing
						validateFields={validateFields}
						errors={pricingErrors[index]}
						data={pricing}
						onChange={ticketPrice => {
							let pricings = [...this.state.data.pricing];
							pricings.splice(index, 1, pricing);
							let data = this.state.data;
							data.pricing = pricings;
							this.setState({ data });
						}}
						onDelete={ticketPrice => {
							let pricings = [...this.state.data.pricing];
							pricings.splice(index, 1);
							let data = this.state.data;
							data.pricing = pricings;
							this.setState({ data }, () => {
								if (this.state.data.pricing.length === 0) {
									this.addPricing();
								}
							});
						}}
					/>
				</Grid>
			);
		});
		return ticketPricings;
	}

	render() {
		const { onDelete, validateFields, errors = {} } = this.props;
		const { data } = this.state;
		const {
			id,
			eventId,
			name,
			startDate,
			endDate,
			capacity,
			increment,
			//limit,
			pricing
		} = data;

		return (
			<Grid container spacing={8} alignItems={"center"}>
				<Grid item xs={7}>
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
						onBlur={validateFields}
					/>
				</Grid>
				<Grid item xs={2}>
					<Tooltip
						title={
							id
								? "You can't adjust capacity once ticket has been created."
								: ""
						}
					>
						<span>
							<InputGroup
								disabled={!!id}
								error={errors.capacity}
								value={capacity}
								name="capacity"
								label="Capacity"
								placeholder="500"
								type="number"
								onChange={e => {
									this.setField("capacity", e.target.value);
								}}
								onBlur={validateFields}
							/>
						</span>
					</Tooltip>
				</Grid>
				<Grid item xs={2}>
					<InputGroup
						error={errors.increment}
						value={increment}
						name="increment"
						label="Increment"
						placeholder="1"
						type="number"
						onChange={e => {
							this.setField("increment", e.target.value);
						}}
						onBlur={validateFields}
					/>
				</Grid>
				{onDelete ? (
					<Grid item xs>
						<div style={{ flex: 1 }} />
						<IconButton onClick={e => onDelete(data)} color="inherit">
							<DeleteIcon />
						</IconButton>
					</Grid>
				) : null}
				<Grid item xs={6}>
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
				<Grid item xs={6}>
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
				<div style={{ display: "flex" }}>
					<Typography variant="headline">Pricing</Typography>
					<IconButton onClick={this.addPricing.bind(this)} aria-label="Add">
						<AddIcon />
					</IconButton>
				</div>
				{this.renderTicketPricing()}
			</Grid>
		);
	}
}

Ticket.propTypes = {
	data: PropTypes.object,
	onChange: PropTypes.func,
	//onError: PropTypes.func,
	onDelete: PropTypes.func,
	validateFields: PropTypes.func.isRequired,
	errors: PropTypes.object
};

Ticket.Structure = (ticket = {}) => {
	const defaultTicket = {
		id: "",
		eventId: "",
		name: "",
		startDate: null,
		endDate: null,
		capacity: 0,
		increment: 1,
		//limit: 0, //Limit per purchase
		pricing: [],
		submitAttempted: false
	};
	return Object.assign(defaultTicket, ticket);
};
export default withStyles(styles)(Ticket);
