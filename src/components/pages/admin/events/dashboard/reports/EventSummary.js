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

class EventSummary extends Component {
	constructor(props) {
		super(props);

		this.state = { eventSales: null, revenueShare: null };
	}

	componentDidMount() {
		this.refreshData();
	}

	exportCSV() {
		const { eventSales } = this.state;

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

		csvRows.push([
			"Ticket",
			"Price",
			"Online",
			"Box office",
			"Total sold",
			"Comps",
			"Total value"
		]);

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

		downloadCSV(csvRows, "event-summary-report");
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

						totals.online_count = totals.online_count + sale.online_count;
						totals.box_office_count =
							totals.box_office_count + sale.box_office_count;
						totals.total_sold = totals.total_sold + sale.total_sold;
						totals.comp_count = totals.comp_count + sale.comp_count;
						totals.total_gross_income_in_cents =
							totals.total_gross_income_in_cents +
							sale.total_gross_income_in_cents;

						eventSales[ticket_type_id].pricePoints.push(sale);
						eventSales[ticket_type_id].totals = totals;
					}
				});

				let revenueShare = {};

				ticket_fees.forEach(fee => {
					const { ticket_type_id } = fee;

					if (!eventSales[ticket_type_id]) {
						revenueShare[ticket_type_id] = {
							name: fee.ticket_name,
							pricePoints: [fee],
							totals: {
								//TODO
								//Leave out box office
							}
						};
					} else {
						//TODO
					}
				});

				// console.log("ticket_fees: ", ticket_fees);
				// console.log("other_fees: ", other_fees);

				this.setState({ eventSales, revenueShare });
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

	renderEventSales() {
		const { eventSales, hoverIndex } = this.state;

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

		const ths = [
			"Ticket",
			"Price",
			"Online",
			"Box office",
			"Total sold",
			"Comps",
			"Total value"
		];

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>All event sales</Typography>

				<EventSummaryRow heading>{ths}</EventSummaryRow>

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
									comp_count,
									total_sold,
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
										pricePoint.comp_count,
										pricePoint.total_sold,
										dollars(pricePoint.total_gross_income_in_cents)
									]}
								</EventSummaryRow>
							))}
						</div>
					);
				})}
			</div>
		);
	}

	renderRevenueShare() {
		const { revenueShare, hoverIndex } = this.state;

		if (!revenueShare) {
			return null;
		}

		if (revenueShare.length === 0) {
			return <Typography>No event summary available.</Typography>;
		}

		const ths = [
			"Ticket",
			"Price",
			"Online rev share",
			"Online",
			"Box office rev share",
			"Box office",
			"Total value"
		];

		const { classes } = this.props;

		return (
			<div>
				<Typography className={classes.subHeading}>Revenue share</Typography>

				<EventSummaryRow heading>{ths}</EventSummaryRow>

				{/* {Object.keys(revenueShare).map((ticketId, index) => {
					const ticketSale = revenueShare[ticketId];
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
									comp_count,
									total_sold,
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
										pricePoint.comp_count,
										pricePoint.total_sold,
										dollars(pricePoint.total_gross_income_in_cents)
									]}
								</EventSummaryRow>
							))}
						</div>
					);
				})} */}
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
