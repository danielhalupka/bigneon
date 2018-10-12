import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
	Typography,
	withStyles,
	Grid,
	Card,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	CardContent
} from "@material-ui/core";
import moment from "moment";

import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";

const styles = theme => ({
	paper: {},
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
				this.setState({ orders: data });
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
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (orders && orders.length > 0) {
			return (
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell numeric>Order #</TableCell>
							{/* <TableCell numeric>Event</TableCell> */}
							<TableCell numeric>Tickets</TableCell>
							<TableCell numeric>Total</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.map(order => {
							const { id, date, total_in_cents, items } = order;

							const formattedDate = moment
								.utc(date, moment.HTML5_FMT.DATETIME_LOCAL_MS)
								.format("dddd, MMM D, HH:mm");

							//TODO move this to when we fetch the data so it's not executed on each render
							let tickets = 0;
							let eventName = ""; //TODO get this when available in the API
							const orderNumber = id.slice(-8); //TODO eventually this will also come in the API
							items.forEach(item => {
								const { item_type, quantity } = item;

								if (item_type === "Tickets") {
									tickets = tickets + quantity;
								}
							});

							return (
								<TableRow key={id}>
									<TableCell component="th" scope="row">
										{formattedDate}
									</TableCell>
									<TableCell numeric>
										<Link
											style={{ textDecoration: "none" }}
											to={`/orders/${id}`}
										>
											{orderNumber}
										</Link>
									</TableCell>
									{/* <TableCell numeric>{eventName}</TableCell> */}
									<TableCell numeric>{tickets}</TableCell>
									<TableCell numeric>
										$ {(total_in_cents / 100).toFixed(2)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			);
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No orders yet</Typography>
				</Grid>
			);
		}
	}

	render() {
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">Orders</Typography>

				<Card className={classes.paper}>
					<CardContent>
						<Grid container spacing={24}>
							{this.renderOrders()}
						</Grid>
					</CardContent>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(OrderList);
