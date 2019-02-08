import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import TotalsTable from "./TotalsTable";
import InventorySoldTable from "./InventorySoldTable";
import RevenueShareTicket from "./RevenueShareTable";

const eventTotals = ({ other_fees, sales, ticket_fees }) => {
	let faceAmountOwedToClientInCents = 0;
	let serviceFeeRevenueShare = 0;

	sales.forEach(ticketType => {
		faceAmountOwedToClientInCents += ticketType.total_gross_income_in_cents - ticketType.total_client_fee_in_cents - ticketType.total_company_fee_in_cents;
	});

	other_fees.forEach(fees => {
		const { client_fee_in_cents, company_fee_in_cents, total_client_fee_in_cents, total_company_fee_in_cents } = fees;
		serviceFeeRevenueShare += total_client_fee_in_cents;
	});

	return {
		faceAmountOwedToClientInCents,
		serviceFeeRevenueShare,
		totalEventSettlement: faceAmountOwedToClientInCents + serviceFeeRevenueShare
	};
};

const ticketSalesEntries = (sales) => {
	const ticketSales = {};

	const totalSales = {
		onlineCount: 0,
		boxOfficeCount: 0,
		totalSold: 0,
		totalComps: 0,
		totalOwedInCents: 0
	};

	const totalOrdersDue = {
		onlineCount: 0, //TODO order count when it comes in the API
		boxOfficeCount: 0, //TODO order count when it comes in the API
		totalSold: 0, //TODO order count when it comes in the API
		totalOwedInCents: 0
	};

	sales.forEach(ticketPricing => {
		const {
			ticket_type_id,
			ticket_name,
			box_office_count,
			online_count,
			price_in_cents,
			pricing_name,
			ticket_pricing_id,
			total_client_fee_in_cents,
			total_company_fee_in_cents,
			total_gross_income_in_cents,
			comp_count,
			total_sold
		} = ticketPricing;

		if (!ticketSales.hasOwnProperty(ticket_type_id)) {
			ticketSales[ticket_type_id] = {
				name: ticket_name,
				pricings: [],
				onlineCount: 0,
				boxOfficeCount: 0,
				totalSold: 0,
				totalComps: 0,
				totalOwedInCents: 0
			};
		}

		const totalOwedInCents = total_gross_income_in_cents - total_company_fee_in_cents;

		ticketSales[ticket_type_id].onlineCount += online_count;
		ticketSales[ticket_type_id].boxOfficeCount += box_office_count;
		ticketSales[ticket_type_id].totalSold += total_sold;
		ticketSales[ticket_type_id].totalComps += total_sold;
		ticketSales[ticket_type_id].totalOwedInCents += totalOwedInCents;

		ticketSales[ticket_type_id].pricings.push({
			name: pricing_name,
			priceInCents: price_in_cents,
			onlineCount: online_count,
			boxOfficeCount: box_office_count,
			totalSold: total_sold,
			totalComps: comp_count,
			totalOwedInCents
		});

		totalSales.onlineCount += online_count;
		totalSales.boxOfficeCount += box_office_count;
		totalSales.totalSold += total_sold;
		totalSales.totalComps += comp_count;
		totalSales.totalOwedInCents += totalOwedInCents;
	});

	return { ticketSales, totalSales, totalOrdersDue };
};

const revenueShareEntries = (ticket_fees, other_fees) => {
	const ticketFees = {};

	const totalOrderFees = {
		onlineTotalRevShare: 0,
		boTotalRevShare: 0,
		totalRevShare: 0
	};

	const totalOtherFees = {
		onlineTotalRevShare: 0,
		boTotalRevShare: 0,
		totalRevShare: 0
	};

	//Rev share per ticker: client_fee_in_cents
	//Total rev share: total_client_fee_in_cents

	ticket_fees.forEach(ticketFee => {
		const {
			ticket_type_id,
			ticket_name,
			pricing_name,
			price_in_cents,
			client_fee_in_cents,
			total_client_fee_in_cents
		} = ticketFee;

		if (!ticketFees.hasOwnProperty(ticket_type_id)) {
			ticketFees[ticket_type_id] = {
				name: ticket_name,
				pricings: [],
				onlineTotalRevShare: 0,
				boTotalRevShare: 0,
				totalRevShare: 0
			};
		}

		ticketFees[ticket_type_id].onlineTotalRevShare += total_client_fee_in_cents;
		ticketFees[ticket_type_id].boTotalRevShare += 0; //TODO when it comes in the API,
		ticketFees[ticket_type_id].totalRevShare += total_client_fee_in_cents; //TODO add box office total when it comes in the API

		ticketFees[ticket_type_id].pricings.push({
			name: pricing_name,
			priceInCents: price_in_cents,
			onlineRevSharePerTicket: client_fee_in_cents,
			onlineTotalRevShare: total_client_fee_in_cents,
			boRevSharePerTicket: 0, //TODO when it comes in the API,
			boTotalRevShare: 0,
			totalRevShare: total_client_fee_in_cents //TODO add box office total when it comes in the API
		});
	});

	other_fees.forEach(otherFee => {
		const {
			client_fee_in_cents,
			company_fee_in_cents,
			total_client_fee_in_cents,
			total_company_fee_in_cents,
			unit_price_in_cents
		} = otherFee;

		totalOtherFees.onlineTotalRevShare += total_client_fee_in_cents;
		totalOtherFees.boTotalRevShare += 0; //TODO add box office total when it comes in the API
		totalOtherFees.totalRevShare += total_client_fee_in_cents; //TODO add box office total when it comes in the API
	});
	return { ticketFees, totalOrderFees, totalOtherFees };
};

const styles = theme => {
	return {
		root: {
			marginBottom: theme.spacing.unit * 6
		},
		heading: {
			fontSize: theme.typography.fontSize * 1.6,
			fontFamily: fontFamilyDemiBold
		},
		subHeading: {
			fontSize: theme.typography.fontSize * 1.2,
			fontFamily: fontFamilyDemiBold,
			marginTop: theme.spacing.unit * 2
		},
		boldSpan: {
			fontFamily: fontFamilyDemiBold
		}
	};
};

const SingleEventSettlement = props => {
	const { classes, name, eventStartDisplay, venueName, other_fees, sales, ticket_fees } = props;

	const totals = eventTotals({ other_fees, sales, ticket_fees });
	const totalRows = [
		{ label: "Face amount owed to client", valueInCents: totals.faceAmountOwedToClientInCents },
		{ label: "Service fee revenue share", valueInCents: totals.serviceFeeRevenueShare },
		{ label: "Total event settlement", valueInCents: totals.totalEventSettlement }
	];

	const inventorySoldTableData = ticketSalesEntries(sales);
	const revenueShareTableData = revenueShareEntries(ticket_fees, other_fees);

	return (
		<div className={classes.root}>
			<Typography className={classes.heading}>{name}</Typography>
			<Typography>Event start date/time: <span className={classes.boldSpan}>{eventStartDisplay || ""}</span></Typography>
			<Typography>Venue: <span className={classes.boldSpan}>{venueName || ""}</span></Typography>

			<Typography className={classes.subHeading}>Event totals</Typography>
			<TotalsTable rows={totalRows}/>

			<Typography className={classes.subHeading}>Inventory sold (Net)</Typography>
			<InventorySoldTable {...inventorySoldTableData}/>

			<Typography className={classes.subHeading}>Service Fee Revenue Share & Box Office Fees</Typography>
			<RevenueShareTicket {...revenueShareTableData}/>
		</div>
	);
};

SingleEventSettlement.propTypes = {
	classes: PropTypes.object.isRequired,
	name: PropTypes.string,
	eventStart: PropTypes.string,
	venueName: PropTypes.string
};

export default withStyles(styles)(SingleEventSettlement);