import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";

import InputGroup from "../../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import SelectGroup from "../../../../common/form/SelectGroup";
import Button from "../../../../common/Button";
import notifications from "../../../../../stores/notifications";
import api from "../../../../../helpers/api";
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
			data: Ticket.Structure(props.data),
			errors: {}
		};
		this.validateFields = this.validateFields.bind(this);
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

	validateFields() {
		const { onError } = this.props;
		const { data } = this.state;

		const {
			id,
			eventId,
			name,
			description,
			startDate,
			endDate,
			capacity,
			limit,
			pricing
		} = data;

		const errors = {};
		if (!name) {
			errors.name = "Missing ticket name";
		}

		if (!startDate) {
			errors.startDate = "Specify the ticket start date";
		}

		if (!endDate) {
			errors.endDate = "Specify the ticket end date";
		}

		if (capacity === "" || isNaN(capacity)) {
			errors.capacity = "Specify a valid capacity";
		}

		if (limit !== "" && isNaN(limit)) {
			errors.limit = "Specify a valid limit per person";
		}

		const hasErrors = Object.keys(errors).length > 0;
		onError(errors);
		this.setState({ errors });
		return !hasErrors;
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
		let ticketPricings = [];
		this.state.data.pricing.forEach((pricing, index) => {
			ticketPricings.push(
				<Grid item xs={12} key={`ticket_pricing_${index}`}>
					<TicketPricing
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
		let { onDelete } = this.props;
		let { data, errors } = this.state;
		let {
			id,
			eventId,
			name,
			description,
			startDate,
			endDate,
			capacity,
			limit,
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
						onBlur={this.validateFields}
					/>
				</Grid>
				<Grid item xs={2}>
					<InputGroup
						error={errors.capacity}
						value={capacity}
						name="capacity"
						label="Capacity"
						placeholder="500"
						type="number"
						onChange={e => {
							this.setField("capacity", e.target.value);
						}}
						onBlur={this.validateFields}
					/>
				</Grid>
				<Grid item xs={2}>
					<InputGroup
						error={errors.limit}
						value={limit}
						name="limit"
						label="Maximum Allowed"
						placeholder="10"
						type="number"
						onChange={e => {
							this.setField("limit", e.target.value);
						}}
						onBlur={this.validateFields}
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
						label="Onsale Time"
						onChange={startDate => this.setField("startDate", startDate)}
						onBlur={this.validateFields}
						minDate={false}
					/>
				</Grid>
				<Grid item xs={6}>
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
				<div style={{ display: "flex" }}>
					<Typography variant="headline">Price Points</Typography>
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
	onError: PropTypes.func,
	onDelete: PropTypes.func
};

Ticket.Structure = (ticket = {}) => {
	const defaultTicket = {
		id: "",
		eventId: "",
		name: "",
		description: "",
		startDate: "",
		endDate: "",
		capacity: 0,
		limit: 0, //Limit per purchase
		pricing: []
	};
	return Object.assign(defaultTicket, ticket);
};
export default withStyles(styles)(Ticket);
