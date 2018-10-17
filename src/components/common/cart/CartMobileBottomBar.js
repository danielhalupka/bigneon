import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import TimerIcon from "@material-ui/icons/Timer";

import { Typography, Hidden } from "@material-ui/core";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import cart from "../../../stores/cart";
import { primaryHex } from "../../styles/theme";

const styles = theme => {
	return {
		link: {
			width: "100%",
			position: "fixed",
			bottom: 0,
			display: "flex",
			justifyContent: "flex-end",
			zIndex: "100000; position:relative",
			textDecoration: "none"
		},
		bar: {
			justifyContent: "space-around",
			display: "flex",
			flex: 1,
			padding: theme.spacing.unit,
			backgroundColor: primaryHex,
			borderTopRightRadius: theme.shape.borderRadius,
			borderTopLeftRadius: theme.shape.borderRadius
		},
		icon: { color: "#fff", marginRight: theme.spacing.unit / 2 },
		label: { color: "#fff" },
		iconLabelSpan: { display: "flex" },
		expiryTimeSpan: { minWidth: 40 }
	};
};

const CartMobileBottomBar = observer(({ classes }) => {
	const { ticketCount, formattedExpiryTime } = cart;
	if (ticketCount < 1) {
		return null;
	}

	return (
		<Hidden smUp implementation="css">
			<Link to="/cart" className={classes.link}>
				<div className={classes.bar}>
					<span className={classes.iconLabelSpan}>
						<ShoppingCartIcon className={classes.icon} />
						<Typography className={classes.label}>
							{ticketCount} ticket
							{ticketCount > 1 ? "s" : ""}
						</Typography>
					</span>

					<span className={classes.iconLabelSpan}>
						<TimerIcon className={classes.icon} />
						<Typography className={classes.label}>
							<span className={classes.expiryTimeSpan}>
								{formattedExpiryTime}
							</span>
						</Typography>
					</span>
				</div>
			</Link>
		</Hidden>
	);
});

CartMobileBottomBar.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CartMobileBottomBar);
