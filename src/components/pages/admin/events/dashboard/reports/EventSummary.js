import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";

import notifications from "../../../../../../stores/notifications";
import Bigneon from "../../../../../../helpers/bigneon";
import Divider from "../../../../../common/Divider";
import Button from "../../../../../elements/Button";
import downloadCSV from "../../../../../../helpers/downloadCSV";
import EventSummaryRow from "./EventSummaryRow";
import { fontFamilyDemiBold } from "../../../../../styles/theme";

const styles = theme => ({
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

const EVENT_SALES_HEADINGS = [
	"Ticket",
	"Price",
	"Online",
	"Box office",
	"Total sold",
	"Comps",
	"Total value"
];

const REVENUE_SHARE_HEADINGS = [
	"Ticket",
	"Price",
	"Online rev share",
	"Online",
	" ", //"Box office rev share",
	" ", //"Box office",
	"Total value"
];

class EventSummary extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventSales: null,
			revenueShare: null,
			salesTotals: null,
			revenueTotals: null,
			otherFees: null
		};
	}

	componentDidMount() {
		this.refreshData();
	}

	refreshData() {
		const { eventId, organizationId } = this.props;

		let queryParams = { organization_id: organizationId, event_id: eventId };
		//TODO date filter
		//start_utc
		//end_utc

		Bigneon()
			.reports.eventSummary(queryParams)
			.then(response => {
				const { sales, ticket_fees, other_fees } = response.data;

				let eventSales = {};

				//Event summary totals
				let salesTotals = {
					totalOnlineCount: 0,
					totalBoxOfficeCount: 0,
					totalSoldCount: 0,
					totalCompCount: 0,
					totalSalesValueInCents: 0
				};

				//Group sales by ticket type
				sales.forEach(sale => {
					const { ticket_type_id } = sale;

					if (!eventSales[ticket_type_id]) {
						eventSales[ticket_type_id] = {
							name: sale.ticket_name,
							pricePoints: [sale],
							totals: {
								online_count: sale.online_count,
								box_office_count: sale.box_office_count,
								comp_count: sale.comp_count,
								total_gross_income_in_cents: sale.total_gross_income_in_cents,
								total_sold: sale.total_sold
							}
						};
					} else {
						let { totals } = eventSales[ticket_type_id];
						totals.online_count += sale.online_count;
						totals.box_office_count += sale.box_office_count;
						totals.total_sold += sale.total_sold;
						totals.comp_count += sale.comp_count;
						totals.total_gross_income_in_cents +=
							sale.total_gross_income_in_cents;

						eventSales[ticket_type_id].pricePoints.push(sale);
						eventSales[ticket_type_id].totals = totals;
					}

					salesTotals.totalOnlineCount += sale.online_count;
					salesTotals.totalBoxOfficeCount += sale.box_office_count;
					salesTotals.totalSoldCount += sale.total_sold;
					salesTotals.totalCompCount += sale.comp_count;
					salesTotals.totalSalesValueInCents +=
						sale.total_gross_income_in_cents;
				});

				let revenueShare = {};
				let revenueTotals = {
					totalOnlineRevenue: 0,
					//Box office will go here
					totalRevenue: 0
				};

				ticket_fees.forEach(fee => {
					const { ticket_type_id } = fee;

					if (!revenueShare[ticket_type_id]) {
						revenueShare[ticket_type_id] = {
							name: fee.ticket_name,
							pricePoints: [fee],
							totals: {
								comp_count: fee.comp_count,
								company_fee_in_cents: fee.company_fee_in_cents,
								online_count: fee.online_count,
								total_client_fee_in_cents: fee.total_client_fee_in_cents,
								total_company_fee_in_cents: fee.total_company_fee_in_cents,
								total_sold: fee.total_sold
							}
						};
					} else {
						let { totals } = revenueShare[ticket_type_id];

						totals.comp_count += fee.comp_count;
						totals.company_fee_in_cents += fee.company_fee_in_cents;
						totals.online_count += fee.online_count;
						totals.total_client_fee_in_cents += fee.total_client_fee_in_cents;
						totals.total_company_fee_in_cents += fee.total_company_fee_in_cents;
						totals.total_sold += fee.total_sold;

						revenueShare[ticket_type_id].pricePoints.push(fee);
						revenueShare[ticket_type_id].totals = totals;
					}

					revenueTotals.totalOnlineRevenue += fee.total_client_fee_in_cents;
					revenueTotals.totalRevenue += fee.total_client_fee_in_cents;
				});

				let otherFees = other_fees[0];

				if (otherFees) {
					revenueTotals.totalOnlineRevenue +=
						otherFees.total_client_fee_in_cents;
					revenueTotals.totalRevenue += otherFees.total_client_fee_in_cents;
				} else {
					otherFees = { total_client_fee_in_cents: 0 };
				}

				this.setState({
					eventSales,
					revenueShare,
					salesTotals,
					revenueTotals,
					otherFees
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ eventSales: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event transaction report failed."
				});
			});
	}

	exportCSV() {
		const {
			eventSales,
			salesTotals,
			revenueShare,
			revenueTotals,
			otherFees
		} = this.state;

		if (!eventSales) {
			return notifications.show({
				message: "No rows to export.",
				variant: "warning"
			});
		}

		const { eventName } = this.props;

		let csvRows = [];

		let title = "Event summary report";
		if (eventName) {
			title = `${title} - ${eventName}`;
		}

		csvRows.push([title]);
		csvRows.push([""]);

		//Sales details:
		csvRows.push(EVENT_SALES_HEADINGS);

		Object.keys(eventSales).forEach(ticketId => {
			const ticketSale = eventSales[ticketId];
			const { name, pricePoints, totals } = ticketSale;

			const {
				online_count,
				box_office_count,
				comp_count,
				total_sold,
				total_gross_income_in_cents
			} = totals;

			csvRows.push([
				name,
				" ",
				online_count,
				box_office_count,
				comp_count,
				total_sold,
				dollars(total_gross_income_in_cents)
			]);

			pricePoints.forEach(pricePoint => {
				csvRows.push([
					pricePoint.pricing_name,
					dollars(pricePoint.price_in_cents),
					pricePoint.online_count,
					pricePoint.box_office_count,
					pricePoint.comp_count,
					pricePoint.total_sold,
					dollars(pricePoint.total_gross_income_in_cents)
				]);
			});
		});

		const {
			totalOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompCount,
			totalSalesValueInCents
		} = salesTotals;

		csvRows.push([
			"Total sales",
			" ",
			totalOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompCount,
			dollars(totalSalesValueInCents)
		]);

		csvRows.push([""]);
		csvRows.push([""]);

		//Revenue share:
		csvRows.push(REVENUE_SHARE_HEADINGS);
		Object.keys(revenueShare).forEach(ticketId => {
			const fee = revenueShare[ticketId];
			const { name, pricePoints, totals } = fee;

			const {
				comp_count,
				company_fee_in_cents,
				online_count,
				total_client_fee_in_cents,
				total_company_fee_in_cents,
				total_sold
			} = totals;

			csvRows.push([
				name,
				" ",
				total_client_fee_in_cents,
				online_count,
				" ",
				" ",
				dollars(total_client_fee_in_cents)
			]);

			pricePoints.forEach(pricePoint => {
				csvRows.push([
					pricePoint.pricing_name,
					dollars(pricePoint.price_in_cents),
					pricePoint.total_client_fee_in_cents,
					pricePoint.online_count,
					" ",
					" ",
					dollars(pricePoint.total_client_fee_in_cents)
				]);
			});
		});

		csvRows.push([
			"Other fees",
			" ",
			dollars(otherFees.total_client_fee_in_cents),
			" ",
			" ",
			" ",
			dollars(otherFees.total_client_fee_in_cents)
		]);

		const { totalOnlineRevenue, totalRevenue } = revenueTotals;

		csvRows.push([
			"Total revenue share",
			" ",
			dollars(totalOnlineRevenue),
			" ",
			" ",
			" ",
			dollars(totalRevenue)
		]);

		downloadCSV(csvRows, "event-summary-report");
	}

	renderEventSales() {
		const { eventSales, salesTotals } = this.state;

		if (eventSales === false) {
			//Query failed
			return null;
		}

		if (eventSales === null) {
			return <Typography>Loading...</Typography>;
		}

		if (eventSales.length === 0) {
			return <Typography>No event summary available.</Typography>;
		}

		const { classes } = this.props;

		const {
			totalOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompCount,
			totalSalesValueInCents
		} = salesTotals;

		return (
			<div>
				<Typography className={classes.subHeading}>All event sales</Typography>

				<EventSummaryRow heading>{EVENT_SALES_HEADINGS}</EventSummaryRow>

				{Object.keys(eventSales).map((ticketId, index) => {
					const ticketSale = eventSales[ticketId];
					const { name, pricePoints, totals } = ticketSale;

					const {
						online_count,
						box_office_count,
						comp_count,
						total_sold,
						total_gross_income_in_cents
					} = totals;
					return (
						<div key={ticketId}>
							<EventSummaryRow ticketTypeRow gray={true}>
								{[
									name,
									" ",
									online_count,
									box_office_count,
									total_sold,
									comp_count,
									dollars(total_gross_income_in_cents)
								]}
							</EventSummaryRow>

							{pricePoints.map((pricePoint, priceIndex) => (
								<EventSummaryRow key={priceIndex}>
									{[
										pricePoint.pricing_name,
										dollars(pricePoint.price_in_cents),
										pricePoint.online_count,
										pricePoint.box_office_count,
										pricePoint.total_sold,
										pricePoint.comp_count,
										dollars(pricePoint.total_gross_income_in_cents)
									]}
								</EventSummaryRow>
							))}
						</div>
					);
				})}

				<EventSummaryRow ticketTypeRow total>
					{[
						"Total sales",
						" ",
						totalOnlineCount,
						totalBoxOfficeCount,
						totalSoldCount,
						totalCompCount,
						dollars(totalSalesValueInCents)
					]}
				</EventSummaryRow>
			</div>
		);
	}

	renderRevenueShare() {
		const { revenueShare, revenueTotals, otherFees } = this.state;

		if (!revenueShare) {
			return null;
		}

		if (revenueShare.length === 0) {
			return <Typography>No event summary available.</Typography>;
		}

		const { classes } = this.props;

		const { totalOnlineRevenue, totalRevenue } = revenueTotals;

		return (
			<div>
				<Typography className={classes.subHeading}>Revenue share</Typography>

				<EventSummaryRow heading>{REVENUE_SHARE_HEADINGS}</EventSummaryRow>

				{Object.keys(revenueShare).map((ticketId, index) => {
					const fee = revenueShare[ticketId];
					const { name, pricePoints, totals } = fee;

					const {
						comp_count,
						company_fee_in_cents,
						online_count,
						total_client_fee_in_cents,
						total_company_fee_in_cents,
						total_sold
					} = totals;

					return (
						<div key={ticketId}>
							<EventSummaryRow ticketTypeRow gray>
								{[
									name,
									" ",
									dollars(total_client_fee_in_cents),
									online_count,
									" ",
									" ",
									dollars(total_client_fee_in_cents)
								]}
							</EventSummaryRow>

							{pricePoints.map((pricePoint, priceIndex) => (
								<EventSummaryRow key={priceIndex}>
									{[
										pricePoint.pricing_name,
										dollars(pricePoint.price_in_cents),
										dollars(pricePoint.total_client_fee_in_cents),
										pricePoint.online_count,
										" ",
										" ",
										dollars(pricePoint.total_client_fee_in_cents)
									]}
								</EventSummaryRow>
							))}
						</div>
					);
				})}

				<EventSummaryRow ticketTypeRow total noRadius>
					{[
						"Other fees",
						" ",
						dollars(otherFees.total_client_fee_in_cents),
						" ",
						" ",
						" ",
						dollars(otherFees.total_client_fee_in_cents)
					]}
				</EventSummaryRow>

				<EventSummaryRow ticketTypeRow total>
					{[
						"Total revenue share",
						" ",
						dollars(totalOnlineRevenue),
						" ",
						" ",
						" ",
						dollars(totalRevenue)
					]}
				</EventSummaryRow>
			</div>
		);
	}

	render() {
		const { eventId, classes } = this.props;

		return (
			<div>
				<div
					style={{
						display: "flex",
						minHeight: 60,
						alignItems: "center"
					}}
				>
					<Typography variant="title">Event summary report</Typography>
					<span style={{ flex: 1 }} />
					<Button
						iconUrl="/icons/csv-active.svg"
						variant="text"
						onClick={this.exportCSV.bind(this)}
					>
						Export CSV
					</Button>
				</div>
				<Divider style={{ marginBottom: 40 }} />

				{this.renderEventSales()}

				<br />
				<br />

				{this.renderRevenueShare()}
			</div>
		);
	}
}

EventSummary.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	eventId: PropTypes.string.isRequired,
	eventName: PropTypes.string
};

export default withStyles(styles)(EventSummary);
