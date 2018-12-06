import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography, Collapse } from "@material-ui/core";

import Card from "../../../elements/Card";
import { fontFamilyDemiBold, secondaryHex } from "../../../styles/theme";
import GuestTicketRow from "./GuestTicketRow";
import CheckBox from "../../../elements/form/CheckBox";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit / 2
	},
	inner: {
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit * 1.5,
		paddingBottom: theme.spacing.unit,
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between"
	},
	indexNumber: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2,
		color: secondaryHex
	},
	name: {
		marginLeft: theme.spacing.unit / 2,
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2
	},
	ticketInfo: {
		color: "#9DA3B4"
	},
	leftContent: {},
	rightContent: {},
	topRow: {
		display: "flex"
	},
	bottomRow: {
		display: "flex"
	},
	expandContainer: {
		cursor: "pointer",
		height: "100%"
	},
	expandIcon: {
		height: 10
	},
	ticketContainer: {
		padding: theme.spacing.unit * 2
	}
});

const GuestRow = props => {
	const {
		index,
		userId,
		email,
		first_name,
		last_name,
		phone,
		tickets,
		onExpandChange,
		expanded,
		onTicketSelect,
		selectedTickets,
		classes
	} = props;

	return (
		<div className={classes.root}>
			<Card>
				<div className={classes.inner}>
					<div className={classes.leftContent}>
						<div className={classes.topRow}>
							<Typography className={classes.indexNumber}>
								{index + 1}.
							</Typography>
							<Typography className={classes.name}>
								{last_name}, {first_name}
							</Typography>
						</div>
						<div className={classes.bottomRow}>
							<Typography className={classes.ticketInfo}>
								{tickets.map(({ id }) => {
									return <span key={id}>#{id.slice(-8)}. </span>;
								})}
							</Typography>
						</div>
					</div>
					<div className={classes.rightContent}>
						<div
							className={classes.expandContainer}
							onClick={() => onExpandChange(expanded ? null : userId)}
						>
							<img
								alt="Expand icon"
								className={classes.expandIcon}
								src={
									expanded ? "/icons/up-active.svg" : "/icons/down-active.svg"
								}
							/>
						</div>
					</div>
				</div>

				<Collapse in={expanded}>
					<div className={classes.ticketContainer}>
						<GuestTicketRow heading>
							<span>&nbsp;</span>
							<span>Ticket #</span>
							<span>Order #</span>
							<span>Ticket type</span>
							<span>Price</span>
							<span>Status</span>
						</GuestTicketRow>

						{tickets.map(ticket => {
							const {
								id,
								ticket_type,
								price_in_cents,
								order_id,
								status
							} = ticket;
							const isPurchased = status === "Purchased";

							return (
								<GuestTicketRow key={id}>
									<span>
										{isPurchased ? (
											<CheckBox
												active={!!selectedTickets[id]}
												onClick={() => onTicketSelect(ticket)}
											/>
										) : null}
									</span>
									<Typography>{id.slice(-8)}</Typography>
									<Typography>{order_id ? order_id.slice(-8) : "-"}</Typography>
									<Typography>{ticket_type}</Typography>
									<Typography>$ {(price_in_cents / 100).toFixed(2)}</Typography>
									<Typography>{status}</Typography>
								</GuestTicketRow>
							);
						})}
					</div>
				</Collapse>
			</Card>
		</div>
	);
};

GuestRow.propTypes = {
	classes: PropTypes.object.isRequired,
	userId: PropTypes.string.isRequired,
	first_name: PropTypes.string,
	last_name: PropTypes.string,
	tickets: PropTypes.array.isRequired,
	onExpandChange: PropTypes.func.isRequired,
	expanded: PropTypes.bool.isRequired,
	onTicketSelect: PropTypes.func.isRequired,
	selectedTickets: PropTypes.object.isRequired
};

export default withStyles(styles)(GuestRow);
