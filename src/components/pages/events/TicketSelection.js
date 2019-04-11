import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";
import Divider from "../../common/Divider";
import NumberSelect from "../../elements/form/NumberSelect";
import nl2br from "../../../helpers/nl2br";
import { dollars } from "../../../helpers/money";

const styles = theme => ({
	container: {
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit
	},
	price: {
		fontSize: theme.typography.fontSize * 1.8,
		fontFamily: fontFamilyDemiBold,
		color: theme.palette.secondary.main
	},
	name: {
		fontSize: theme.typography.fontSize,
		fontFamily: fontFamilyDemiBold
	},
	unavailable: {
		fontSize: theme.typography.fontSize * 0.8,
		color: "gray",
		textAlign: "center"
	},
	description: {
		fontSize: theme.typography.fontSize * 0.75,
		color: "#9DA3B4"
	},
	detailContainer: {
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit
	},
	readMoreLessText: {
		marginTop: theme.spacing.unit / 2,
		font: "inherit",
		color: secondaryHex,
		cursor: "pointer",
		fontSize: theme.typography.fontSize * 0.75
	},
	promoAppliedText: {
		backgroundColor: secondaryHex,
		color: "#FFFFFF",
		borderRadius: 4,
		paddingTop: 8,
		paddingBottom: 3,
		paddingLeft: 14,
		paddingRight: 14,
		display: "inline-block",
		marginBottom: 4,
		fontSize: theme.typography.fontSize * 0.8125,
		textTransform: "capitalize"
	}
});

class TicketSelection extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showDescription: false
		};
	}

	readMoreLess() {
		this.setState(({ showDescription }) => ({ showDescription: !showDescription }));
	}

	render() {
		const {
			available,
			classes,
			error,
			name,
			description,
			price_in_cents,
			amount,
			increment,
			onNumberChange,
			validateFields,
			limitPerPerson,
			discount_in_cents,
			discount_as_percentage,
			redemption_code
		} = this.props;

		const { showDescription } = this.state;

		// const incrementText =
		// 	increment > 1 ? `(Tickets must be bought in groups of ${increment})` : "";

		const lppText =
			limitPerPerson && amount == limitPerPerson
				? `there is a ${limitPerPerson} ticket limit`
				: "";

		const calculatedPriceInCents = redemption_code && discount_in_cents ? price_in_cents - discount_in_cents : price_in_cents;
		let discount_message = "";
		if (discount_as_percentage) {
			discount_message = discount_as_percentage + "% Discount applied";
		} else if (discount_in_cents){
			discount_message = dollars(discount_in_cents) + " Discount applied";
		}
		return (
			<div>
				<Grid alignItems="center" className={classes.container} container>
					{redemption_code ? (
						<Grid item xs={12} sm={12} md={12} lg={12}>
							<Typography className={classes.promoAppliedText}>
								{discount_message ? discount_message : "Code applied"}
							</Typography>
						</Grid>
					) : null}

					<Grid item xs={3} sm={3} md={4} lg={3}>
						<Typography className={classes.price}>
							{available ? `${dollars(calculatedPriceInCents, true)}` : ""}
						</Typography>
					</Grid>
					<Grid item xs={6} sm={6} md={5} lg={6} className={classes.detailContainer}>
						<Typography className={classes.name}>{name}</Typography>
						<Typography variant="caption" style={{ color: "red" }}>
							{lppText}
						</Typography>
						{description && !discount_in_cents ? (
							<Typography className={classes.readMoreLessText} onClick={this.readMoreLess.bind(this)}>
								{showDescription ? "Read Less" : "Read More"}
							</Typography>
						) : null}
					</Grid>

					<Grid item xs={3} sm={3} md={3} lg={3}>
						{available ? (
							<NumberSelect
								onIncrement={() => {
									const currentAmount = amount ? amount : 0;
									let newAmount = Number(currentAmount) + increment;

									if (limitPerPerson && newAmount > limitPerPerson) {
										newAmount = limitPerPerson;
									}

									onNumberChange(newAmount);
									validateFields();
								}}
								onDecrement={() => {
									const currentAmount = amount ? amount : 0;
									let newAmount = Number(currentAmount) - increment;
									if (newAmount < 0) {
										newAmount = 0;
									}

									onNumberChange(newAmount);
									validateFields();
								}}
							>
								{amount}
							</NumberSelect>
						) : (
							<Typography className={classes.unavailable}>Unavailable</Typography>
						)}
					</Grid>
				</Grid>

				{showDescription ? (
					<Grid
						justify="flex-end"
						alignItems="flex-end"
						container
					>
						<Grid item xs={9} sm={9} md={8} lg={9} className={classes.detailContainer}>
							{description ? <Typography className={classes.description}>{nl2br(description)}</Typography> : null}
						</Grid>
					</Grid>
				) : null }

				<Divider style={{ margin: 0 }}/>
			</div>
		);
	}
}

TicketSelection.propTypes = {
	available: PropTypes.bool,
	onNumberChange: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	description: PropTypes.string,
	price_in_cents: PropTypes.number.isRequired,
	discount_in_cents: PropTypes.number,
	redemption_code: PropTypes.string,
	error: PropTypes.string,
	amount: PropTypes.number,
	increment: PropTypes.number.isRequired,
	validateFields: PropTypes.func.isRequired,
	limitPerPerson: PropTypes.number,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TicketSelection);
