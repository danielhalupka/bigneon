import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";
import { observer } from "mobx-react";

import OrderRow from "./OrderRow";
import StyledLink from "../../elements/StyledLink";
import PageHeading from "../../elements/PageHeading";
import orders from "../../../stores/orders";
import Loader from "../../elements/loaders/Loader";

const styles = theme => ({});

@observer
class OrderList extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		orders.refreshOrders();
	}

	renderOrders() {
		const { items, orderCount } = orders;

		if (items === null) {
			return <Loader/>;
		}

		if (orderCount > 0) {
			return (
				<div>
					<OrderRow>
						<Typography variant="subheading">Date</Typography>
						<Typography>Order # </Typography>
						<Typography>Event</Typography>
						<Typography>Tickets</Typography>
						<Typography>Total</Typography>
					</OrderRow>
					{items.map(order => {
						const { id, date, total_in_cents, items } = order;

						const formattedDate = moment
							.utc(date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
							.format("MM/DD/YYYY");

						let ticketCount = 0;
						let eventName = ""; //TODO get this when available in the API
						const orderNumber = id.slice(-8); //TODO eventually this will also come in the API
						items.forEach(item => {
							const { item_type, quantity, description } = item;

							if (item_type === "Tickets") {
								ticketCount = ticketCount + quantity;
								if (!eventName) {
									eventName = description;
								}
							}
						});

						return (
							<OrderRow item key={id}>
								<Typography>{formattedDate}</Typography>
								<Typography>
									<StyledLink underlined to={`/orders/${id}`}>
										{orderNumber}
									</StyledLink>
								</Typography>
								<Typography>{eventName}</Typography>
								<Typography>{ticketCount}</Typography>
								<Typography>$ {(total_in_cents / 100).toFixed(2)}</Typography>
							</OrderRow>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No orders yet</Typography>;
		}
	}

	render() {
		return (
			<div>
				<PageHeading iconUrl="/icons/chart-multi.svg">My orders</PageHeading>
				{this.renderOrders()}
			</div>
		);
	}
}

export default withStyles(styles)(OrderList);
