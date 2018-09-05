import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import cart from "../../../stores/cart";
import { primaryHex } from "../../styles/theme";

const styles = theme => ({
	menuButton: {
		color: primaryHex,
		boxShadow: "0 2px 2px 0px rgba(1, 1, 1, 0)"
	},
	rightIcon: {
		marginRight: theme.spacing.unit,
		marginBottom: 4
	}
});

const CartHeaderLink = observer(({ classes }) => {
	const { ticketCount } = cart;
	if (ticketCount < 1) {
		return null;
	}

	return (
		<Link to="/cart" style={{ textDecoration: "none" }}>
			<Button className={classes.menuButton}>
				<ShoppingCartIcon className={classes.rightIcon} />
				{ticketCount}
			</Button>
		</Link>
	);
});

CartHeaderLink.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CartHeaderLink);
