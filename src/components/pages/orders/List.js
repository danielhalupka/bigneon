import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";

import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";
import OrderRow from "./OrderRow";
import UnderlinedLink from "../../elements/UnderlinedLink";
import PageHeading from "../../elements/PageHeading";

const styles = theme => ({
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	table: {}
});

class OrderList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			orders: null
		};
	}

	componentDidMount() {
		Bigneon()
			.orders.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ orders: data || response.data }); //TODO remove 'response.data' when bn-api-node is updated
			})
			.catch(error => {
				console.error(error);
				let message = "Loading orders failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	renderOrders() {
		const { orders } = this.state;
		const { classes } = this.props;

		if (orders === null) {
			return <Typography variant="body1">Loading...</Typography>;
		}

		if (orders && orders.length > 0) {
			return (
				<div>
					<OrderRow>
						<Typography variant="subheading">Date</Typography>
						<Typography>Order # </Typography>
						<Typography>Event</Typography>
						<Typography>Tickets</Typography>
						<Typography>Total</Typography>
					</OrderRow>
					{orders.map(order => {
						const { id, date, total_in_cents, items } = order;

						const formattedDate = moment
							.utc(date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
							.format("MM/DD/YYYY");

						//TODO move this to when we fetch the data so it's not executed on each render
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
									<UnderlinedLink to={`/orders/${id}`}>
										{orderNumber}
									</UnderlinedLink>
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
				<PageHeading iconUrl="/icons/orders-multi.svg">My orders</PageHeading>

				{this.renderOrders()}
			</div>
		);
	}
}

export default withStyles(styles)(OrderList);
