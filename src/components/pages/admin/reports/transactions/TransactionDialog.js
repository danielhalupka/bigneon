import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import Dialog from "../../../../elements/Dialog";
import { fontFamilyDemiBold, fontFamilyBold } from "../../../../../config/theme";
import StyledLink from "../../../../elements/StyledLink";
import { dollars } from "../../../../../helpers/money";

const styles = theme => ({
	title: {
		fontSize: theme.typography.fontSize * 1.5,
		fontFamily: fontFamilyBold
	},
	heading: {
		fontFamily: fontFamilyDemiBold
	},
	subheading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2,
		color: "#9DA3B4",
		textAlign: "center",
		marginBottom: theme.spacing.unit * 2
	}
});

const Detail = ({ label, children, classes }) => (
	<Typography>
		<span className={classes.heading}>{label}: </span>
		{children}
	</Typography>
);

class TransactionDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	renderUserDetails() {
		const { classes, item } = this.props;
		if (!item) {
			return null;
		}
		const { first_name, last_name, email } = item;

		return (
			<div>
				<Typography className={classes.title}>User:</Typography>
				<Typography>
					{first_name} {last_name}
				</Typography>
				<Typography>{email}</Typography>
			</div>
		);
	}

	renderItemDetails() {
		const { item, classes } = this.props;
		if (!item) {
			return null;
		}

		const {
			gross_fee_in_cents_total,
			event_fee_gross_in_cents_total,
			gross,
			order_id,
			order_type,
			payment_method,
			quantity,
			redemption_code,
			formattedDate,
			unit_price_in_cents,
			refunded_quantity,
			promo_code_name,
			promo_redemption_code,
			...rest
		} = item;

		return (
			<div>
				<Detail label={"Quantity"} classes={classes}>
					{quantity}
				</Detail>

				<Detail label={"Refunded Quantity"} classes={classes}>
					{refunded_quantity}
				</Detail>

				<Detail label={"Unit price"} classes={classes}>
					{dollars(unit_price_in_cents)}
				</Detail>

				<Detail label={"Total face value"} classes={classes}>
					{dollars((quantity - refunded_quantity) * unit_price_in_cents)}
				</Detail>

				<Detail label={"Service fee"} classes={classes}>
					{dollars(event_fee_gross_in_cents_total + gross_fee_in_cents_total)}
				</Detail>

				<Detail label={"Gross"} classes={classes}>
					{dollars(gross)}
				</Detail>

				<Detail label={"Payment method"} classes={classes}>
					{payment_method}
				</Detail>

				<Detail label={"Transaction date"} classes={classes}>
					{formattedDate}
				</Detail>

				<Detail label={"Order type"} classes={classes}>
					{order_type}
				</Detail>

				{promo_code_name ? (
					<Detail label={"Promo name"} classes={classes}>
						{promo_code_name}
					</Detail>
				) : null}

				{redemption_code || promo_redemption_code ? (
					<Detail label={"Redemption code"} classes={classes}>
						{redemption_code || promo_redemption_code}
					</Detail>
				) : null}

				<Detail label={"Order"} classes={classes}>
					<StyledLink href={`/orders/${order_id}`} target="_blank" underlined>
						#{order_id.slice(-8)}
					</StyledLink>
				</Detail>
			</div>
		);
	}

	render() {
		const { open, item, onClose, classes } = this.props;

		let title = "";
		let subheading = "";

		if (item) {
			title = item.ticket_name;
			subheading = item.event_name;
		}

		return (
			<Dialog
				title={title}
				open={open}
				iconUrl="/icons/tickets-white.svg"
				onClose={onClose}
			>
				<div>
					{subheading ? (
						<Typography className={classes.subheading}>{subheading}</Typography>
					) : null}
					{this.renderItemDetails()}
					<br/>
					{this.renderUserDetails()}
				</div>
			</Dialog>
		);
	}
}

TransactionDialog.propTypes = {
	userId: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
	item: PropTypes.object
};

export default withStyles(styles)(TransactionDialog);
