import React, { Component } from "react";
import {
	Typography,
	withStyles,
	Card,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	CardContent,
	TableFooter
} from "@material-ui/core";

import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";

const styles = theme => ({
	paper: {}
});

class Order extends Component {
	constructor(props) {
		super(props);

		this.state = {
			order: null
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;
			Bigneon()
				.orders.read({ id })
				.then(response => {
					const { data } = response;
					this.setState({ order: data });
				})
				.catch(error => {
					console.error(error);
					let message = "Loading order details failed.";
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
		} else {
			//TODO return 404
		}
	}

	render() {
		const { classes } = this.props;
		const { order } = this.state;

		if (!order) {
			return <Typography>Loading...</Typography>; //TODO add a loader
		}

		const { id, date, total_in_cents, items } = order;

		//We can only get the event name from fields in the items array. Append a list if there's more than one.
		let eventName = "";
		let fee_total_in_cents = 0;
		items.forEach(
			({ description, item_type, unit_price_in_cents, quantity }) => {
				if (item_type === "Tickets") {
					if (eventName === "") {
						eventName = description;
					} else {
						eventName = `${eventName}, ${description}`;
					}
				} else if (item_type === "Fees") {
					fee_total_in_cents =
						fee_total_in_cents + unit_price_in_cents * quantity;
				}
			}
		);

		const orderNumber = id.slice(-8); //TODO eventually this will also come in the API

		return (
			<div>
				<Typography variant="display2">Order #{orderNumber}</Typography>
				<Card className={classes.paper}>
					<CardContent>
						<Typography variant="headline">{eventName}</Typography>
						<Typography variant="caption">Ordered {date}</Typography>

						<Table className={classes.table}>
							<TableHead>
								<TableRow>
									<TableCell padding="checkbox">Quantity</TableCell>
									<TableCell numeric>Ticket type</TableCell>
									<TableCell numeric>Price</TableCell>
									<TableCell numeric>Subtotal</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{items.map(item => {
									const {
										id,
										ticket_type_id,
										ticket_pricing_id,
										quantity,
										unit_price_in_cents,
										item_type,
										description
									} = item;

									return (
										<TableRow key={id}>
											<TableCell padding="checkbox">{quantity}</TableCell>
											<TableCell numeric>{description}</TableCell>
											<TableCell numeric>
												{(unit_price_in_cents / 100).toFixed(2)}
											</TableCell>
											<TableCell numeric>
												{((unit_price_in_cents / 100) * quantity).toFixed(2)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
							<TableFooter>
								<TableRow>
									<TableCell>&nbsp;</TableCell>
									<TableCell>&nbsp;</TableCell>
									<TableCell numeric>Service fees</TableCell>
									<TableCell numeric>
										$ {(fee_total_in_cents / 100).toFixed(2)}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>&nbsp;</TableCell>
									<TableCell>&nbsp;</TableCell>
									<TableCell numeric>Order total</TableCell>
									<TableCell numeric>
										$ {(total_in_cents / 100).toFixed(2)}
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</CardContent>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Order);
