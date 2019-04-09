import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import TimerIcon from "@material-ui/icons/Timer";
import cart from "../../../stores/cart";
import { primaryHex } from "../../../config/theme";

const styles = theme => ({
	menuButton: {
		color: primaryHex,
		boxShadow: "0 2px 2px 0px rgba(1, 1, 1, 0)"
	},
	rightIcon: {
		marginRight: theme.spacing.unit / 2,
		marginBottom: 4
	},
	spacer: {
		marginRight: theme.spacing.unit * 1.5
	},
	expiryTimeSpan: {
		minWidth: 32
	}
});

const CartHeaderLink = observer(({ classes }) => {
	const { ticketCount, formattedExpiryTime, latestEventId } = cart;
	if (ticketCount < 1) {
		return null;
	}

	//Only if we have an event id can we link to the right checkout page
	const LinkContainer = latestEventId
		? props => <Link {...props}/>
		: props => <div {...props}/>;

	return (
		<LinkContainer to={`/events/${latestEventId}/tickets/confirmation`}>
			<Button className={classes.menuButton}>
				<ShoppingCartIcon className={classes.rightIcon}/>
				{ticketCount}

				<span className={classes.spacer}/>

				<TimerIcon className={classes.rightIcon}/>
				<span className={classes.expiryTimeSpan}>{formattedExpiryTime}</span>
			</Button>
		</LinkContainer>
	);
});

CartHeaderLink.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CartHeaderLink);
