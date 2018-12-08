import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";

import Card from "../../../elements/Card";
import NumberSelect from "../../../elements/form/NumberSelect";
import { fontFamilyDemiBold } from "../../../styles/theme";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit
	},
	inner: {
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		display: "flex",
		alignItems: "center"
	},
	icon: {
		width: "auto",
		height: "100%",
		marginRight: theme.spacing.unit * 1.8
	},
	verticalDivider: {
		borderLeft: "1px solid #DEE2E8",
		height: 50,
		marginLeft: theme.spacing.unit * 2
	},
	name: {
		fontFamily: fontFamilyDemiBold,
		lineHeight: 1,
		fontSize: theme.typography.fontSize * 1.2
	},
	remaining: {
		marginTop: theme.spacing.unit,
		color: "#9DA3B4",
		fontSize: theme.typography.fontSize * 0.95,
		lineHeight: 1,
		textTransform: "capitalize"
	},
	price: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5
	}
});

const TicketRow = props => {
	const {
		iconUrl,
		name,
		available,
		priceInCents,
		value,
		onChange,
		type,
		disabled,
		classes
	} = props;

	const columnStyles = [
		{ flex: 1, textAlign: "left" },
		{ flex: 20, textAlign: "left" },
		{ flex: 4, textAlign: "right" },
		{ flex: 1, textAlign: "center" },
		{ flex: 2, textAlign: "center" }
	];

	let displayPrice = "";
	if (!disabled) {
		displayPrice =
			type === "comp" || priceInCents === 0
				? "Free"
				: `$${(priceInCents / 100).toFixed(2)}`;
	}

	return (
		<div className={classes.root}>
			<Card>
				<div className={classes.inner}>
					{iconUrl ? (
						<img
							alt={"Ticket"}
							src={iconUrl}
							className={classes.icon}
							style={columnStyles[0]}
						/>
					) : null}
					<div style={columnStyles[1]}>
						<Typography className={classes.name}>{name}</Typography>
						<Typography className={classes.remaining}>
							{available} tickets remaining
						</Typography>
					</div>
					<Typography className={classes.price} style={columnStyles[2]}>
						{displayPrice}
					</Typography>
					<div style={columnStyles[3]}>
						<div className={classes.verticalDivider} />
					</div>

					<div style={columnStyles[4]}>
						{disabled ? (
							<Typography>Unavailable</Typography>
						) : (
							<NumberSelect
								onIncrement={() => onChange(value ? value + 1 : 1)}
								onDecrement={() => {
									const newValue = value ? value - 1 : 0;
									if (newValue >= 0) {
										onChange(newValue);
									}
								}}
							>
								{value}
							</NumberSelect>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
};

TicketRow.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	available: PropTypes.number.isRequired,
	priceInCents: PropTypes.number.isRequired,
	value: PropTypes.number,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	type: PropTypes.oneOf(["ticket", "discount", "comp"]).isRequired
};

export default withStyles(styles)(TicketRow);
