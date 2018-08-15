import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import moment from "moment";

import InputGroup from "../../../common/form/InputGroup";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../common/form/SelectGroup";
import Button from "../../../common/Button";
import notifications from "../../../../stores/notifications";
import api from "../../../../helpers/api";
import { PropTypes } from "mobx-react";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class Ticket extends Component {
	constructor(props) {
		super(props);

		this.state = {
			id: "",
			eventId: "",
			name: "",
			description: "",
			startDate: "",
			endDate: "",
			quantity: 0,
			limit: 0,
			pricing: []
		};
	}

	static getDerivedStateFromProps(props, state) {
		let {
			id = "",
			eventId = "",
			name = "",
			description = "",
			startDate = "",
			endDate = "",
			quantity = 0,
			limit = 0,
			pricing = []
		} = props.ticketData;
		state = {
			id,
			eventId,
			name,
			description,
			startDate,
			endDate,
			pricing,
			quantity,
			limit
		};
		return state;
	}
	render() {
		let {
			id,
			eventId,
			name,
			description,
			startDate,
			endDate,
			pricing
		} = this.state;
		let s = this.state;
		return <div>{JSON.stringify(s)}</div>;
	}
}

Ticket.propTypes = {
	ticketData: PropTypes.objectOrObservableObject
};
export default withStyles(styles)(Ticket);
