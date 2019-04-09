import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";

import moment from "moment";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold, secondaryHex } from "../../../../config/theme";

const styles = theme => ({
	root: {
		marginTop: theme.spacing.unit
	},
	card: { padding: theme.spacing.unit * 2 },
	date: {
		color: "#9DA3B4",
		fontSize: theme.typography.fontSize * 0.9
	},
	boldSpan: {
		fontFamily: fontFamilyDemiBold
	},
	linkText: {
		color: secondaryHex,
		fontFamily: fontFamilyDemiBold
	},
	verticalDividerSmall: {
		borderLeft: "1px solid #DEE2E8",
		height: 20,
		marginLeft: 15,
		marginRight: 15
	},
	bold: {
		fontFamily: fontFamilyDemiBold
	},
	bottomRow: {
		display: "flex"
	}
});

const FanActivityCard = ({
	order_date,
	type,
	event_name,
	order_id,
	revenue_in_cents,
	ticket_sales,
	event_start,
	event_id,
	classes
}) => (
	<div className={classes.root}>
		<Card variant="subCard">
			<div className={classes.card}>
				{type === "Purchase" ? (
					<div>
						<Typography className={classes.date}>
							{moment(order_date).format("M/D/Y hh:mmA")}
						</Typography>
						<Typography>
							Purchased <span className={classes.boldSpan}>{ticket_sales}</span>{" "}
							ticket
							{ticket_sales > 1 ? "s " : " "}
							for <span className={classes.boldSpan}>{event_name}</span>
						</Typography>
						<div className={classes.bottomRow}>
							<a href={`/orders/${order_id}`} target="_blank">
								<Typography className={classes.linkText}>
								Order #{order_id.slice(-6)}
								</Typography>
							</a>
							<div className={classes.verticalDividerSmall}/>
							<Typography className={classes.bold}>
								${(revenue_in_cents / 100).toFixed(2)}
							</Typography>
						</div>
					</div>
				) : null}

				{type === "Attendance" ? (
					<div>
						<Typography className={classes.date}>
							{moment(event_start).format("M/D/Y hh:mmA")}
						</Typography>
						<Typography>
							Attended&nbsp;
							<a href={`/events/${event_id}`} target="_blank">
								<span className={classes.linkText}>
									{event_name}
								</span>
							</a>
						</Typography>
					</div>
				) : null}

			</div>
		</Card>
	</div>
);

FanActivityCard.propTypes = {
	order_date: PropTypes.string,
	event_start: PropTypes.string,
	ticket_sales: PropTypes.number,
	event_name: PropTypes.string.isRequired,
	event_id: PropTypes.string,
	revenue_in_cents: PropTypes.number,
	order_id: PropTypes.string,
	type: PropTypes.oneOf(["Purchase", "Attendance"]).isRequired

};

export default withStyles(styles)(FanActivityCard);
