import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles,  Typography  } from "@material-ui/core";
import classNames from "classnames";

import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

const styles = theme => ({

});

class FanHistoryCard  extends Component {

	constructor (props) {
		super(props);



	}

	render() {
		const { order_date,
			type,
			event_name,
			order_id,
		
			revenue_in_cents, ticket_sales  } = this.props.item;
	
		return (
			<div>
				<Grid container>
					<Grid item xs={4}>
				Circle
					</Grid>
					<Grid item>
						<Card>
								
							{ type === "Purchase" ? 
								(	<CardContent>
									<Typography>{order_date.toString()}</Typography>
									<Typography>
						Purchased <Typography>{ticket_sales}</Typography> ticket(s) for <Typography>{event_name}</Typography>
									</Typography>
									<Typography>Order #{order_id}</Typography> | <Typography>{revenue_in_cents / 100}</Typography>
								</CardContent>)
								: 
								(
									<Typography>
							Other event
									</Typography>
								)}
						</Card>
			
					</Grid>
				</Grid>
			
			</div>
		);
	}
	
}

FanHistoryCard.propTypes = {
	item: PropTypes.object.isRequired
	// time: PropTypes.object.isRequired,
	// eventId: PropTypes.string.isRequired,
	// type: PropTypes.oneOf(["Purchase", "Attendance"]).isRequired,
	// eventName: PropTypes.string.isRequired,
	// orderId: PropTypes.string,
	// orderDate: PropTypes.object,
	// revenueInCents: PropTypes.number,
	// ticket_count: PropTypes.number
};

export default withStyles(styles)(FanHistoryCard);
