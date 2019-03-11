import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography, Hidden } from "@material-ui/core";

import Card from "../../../elements/Card";
import NumberSelect from "../../../elements/form/NumberSelect";
import { fontFamilyDemiBold } from "../../../styles/theme";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit,
		[theme.breakpoints.down("sm")]: {
			marginBottom: theme.spacing.unit / 2
		}
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
		marginRight: theme.spacing.unit
	},
	verticalDivider: {
		borderLeft: "1px solid #DEE2E8",
		height: 50,
		marginLeft: theme.spacing.unit * 2
	},
	name: {
		fontFamily: fontFamilyDemiBold,
		lineHeight: 1,
		fontSize: theme.typography.fontSize * 1.2,

		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize
		}
	},
	remaining: {
		marginTop: theme.spacing.unit,
		color: "#9DA3B4",
		fontSize: theme.typography.fontSize * 0.95,
		lineHeight: 1,
		textTransform: "capitalize",

		[theme.breakpoints.down("sm")]: {
			marginTop: theme.spacing.unit / 2,
			fontSize: theme.typography.fontSize * 0.9
		}
	},
	price: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5,
		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 1.3
		}
	},
	//Mobile styles
	mobileContainer: {
		display: "flex",
		paddingTop: theme.spacing.unit,
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit
	},
	mobileIconContainer: {
		flex: 1
	},
	mobileInner: {
		flex: 6
	},
	mobileRow1: {
		display: "flex"
	},
	mobileRow2: {
		display: "flex"
	},
	mobilePriceContainer: {
		flex: 2,
		paddingTop: 2
	},
	mobileSelectContainer: {
		flex: 1,
		alignItems: "flex-end",
		justifyContent: "flex-end"
	},
	horizontalDivider: {
		borderTop: "1px solid #DEE2E8",
		marginTop: theme.spacing.unit / 2,
		marginBottom: theme.spacing.unit / 2
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

	let disabledMessage = disabled ? "Unavailable" : "";
	if (available < 1) {
		disabledMessage = "Sold out";
	}

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
				{/*Desktop card*/}
				<Hidden smDown>
					<div className={classes.inner}>
						{iconUrl ? (
							<div className={classes.mobileIconContainer}>
								<img
									alt={"Ticket"}
									src={iconUrl}
									className={classes.icon}
									style={columnStyles[0]}
								/>
							</div>
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
							<div className={classes.verticalDivider}/>
						</div>

						<div style={columnStyles[4]}>
							{disabledMessage ? (
								<Typography>{disabledMessage}</Typography>
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
				</Hidden>

				{/*Mobile card*/}
				<Hidden mdUp>
					<div className={classes.mobileContainer}>
						{iconUrl ? (
							<img
								alt={"Ticket"}
								src={iconUrl}
								className={classes.icon}
							/>
						) : null}
						<div className={classes.mobileInner}>
							<div className={classes.mobileRow1}>

								<div>
									<Typography className={classes.name}>{name}</Typography>
									<Typography className={classes.remaining}>
										{available} tickets remaining
									</Typography>
								</div>
							</div>
							<div className={classes.horizontalDivider}/>
							<div className={classes.mobileRow2}>
								<div className={classes.mobilePriceContainer}>
									<Typography className={classes.price}>
										{displayPrice}
									</Typography>
								</div>

								<div className={classes.mobileSelectContainer}>
									{disabledMessage ? (
										<Typography>{disabledMessage}</Typography>
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
						</div>
					</div>
				</Hidden>
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
