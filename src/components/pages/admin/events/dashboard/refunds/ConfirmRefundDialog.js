import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "../../../../../elements/Dialog";
import Button from "../../../../../elements/Button";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
	content: {
		minWidth: 350,
		alignContent: "center",
		textAlign: "center",
		paddingTop: theme.spacing.unit * 2,

		display: "flex",
		alignItems: "center",
		flexDirection: "column"
	},
	icon: {
		width: 120,
		height: "auto",
		marginBottom: theme.spacing.unit * 3
	}
});

const ConfirmRefundDialog = ({ isRefunding, refundComplete, classes, open, onClose, selectedTickets, onConfirm }) => {
	let total_value_in_cents = 0;
	Object.keys(selectedTickets).forEach(id => {
		const { price_in_cents } = selectedTickets[id];
		total_value_in_cents += price_in_cents;
	});

	const totalValue = total_value_in_cents ? `$${(total_value_in_cents / 100).toFixed(2)}` : "$0";

	let title = `Refund ${Object.keys(selectedTickets).length}`;

	if (isRefunding) {
		title = "Refunding...";
	}

	if (refundComplete) {
		title = "Refund success";
	}

	return (
		<Dialog
			iconUrl={"/icons/tickets-white.svg"}
			open={open}
			title={title}
			onClose={isRefunding ? null : onClose}
		>
			<div className={classes.content}>
				{refundComplete ? (
					<img
						className={classes.icon}
						src={`/icons/${
							isRefunding ? "tickets" : "checkmark-circle"
						}-multi.svg`}
						alt="Refund complete"
					/>
				) : null }

				{Object.keys(selectedTickets).map(id => {
					const { event_name, ticket_type, price_in_cents } = selectedTickets[id];
					const value = `$${(price_in_cents / 100).toFixed(2)}`;

					return (
						<div key={id}><Typography>&bull; {ticket_type} - {event_name} - {value}</Typography> </div>
					);
				})}

				{!isRefunding && !refundComplete ? (
					<Button
						style={{ width: "100%", marginTop: 40 }}
						variant="callToAction"
						onClick={onConfirm}
					>
						Refund {totalValue}
					</Button>
				) : null}

				{refundComplete ? (
					<Button
						style={{ width: "100%", marginTop: 40 }}
						variant="callToAction"
						onClick={onClose}
					>
						Close
					</Button>
				) : null}
			</div>
		</Dialog>
	);
};

ConfirmRefundDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	isRefunding: PropTypes.bool,
	refundComplete: PropTypes.bool,
	selectedTickets: PropTypes.object.isRequired,
	onConfirm: PropTypes.func
};

export default withStyles(styles)(ConfirmRefundDialog);
