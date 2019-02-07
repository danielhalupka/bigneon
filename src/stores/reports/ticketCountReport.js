import { observable, computed, action } from "mobx";
import notifications from "../notifications";
import Bigneon from "../../helpers/bigneon";
import user from "../user";

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

const salesRows = (sales) => {
	sales.forEach(row => {
		const { online_sale_count, box_office_sale_count, online_sales_in_cents, box_office_sales_in_cents } = row;
		row.total_sold_count = online_sale_count + box_office_sale_count;
		row.total_sold_in_cents = online_sales_in_cents + box_office_sales_in_cents;
	});
	return sales;
};

const countsRows = (counts) => {
	counts.forEach(row => {
		const { comp_available_count, hold_available_count } = row;
		row.total_held_tickets = comp_available_count + hold_available_count;
	});
	return counts;
};

const combineTotals = (counts, sales) => {
	const totals = {
		totalAllocation: 0,
		totalSoldOnlineCount: 0,
		totalBoxOfficeCount: 0,
		totalSoldCount: 0,
		totalCompsCount: 0,
		totalHoldsCount: 0,
		totalOpenCount: 0,
		totalReservedCount: 0,
		totalGross: 0
	};
	counts.forEach(row => {
		const {
			allocation_count,
			available_for_purchase_count,
			reserved_count,
			comp_available_count,
			hold_available_count
		} = row;

		const total_held_tickets = comp_available_count + hold_available_count;
		totals.totalAllocation += allocation_count;
		totals.totalHoldsCount += total_held_tickets;
		totals.totalOpenCount += available_for_purchase_count;
		totals.totalReservedCount += reserved_count;
	});

	sales.forEach(row => {
		const {
			online_sale_count,
			box_office_sale_count,
			online_sales_in_cents,
			box_office_sales_in_cents,
			comp_sale_count
		} = row;
		const total_sold_count = online_sale_count + box_office_sale_count;
		const total_sold_in_cents = online_sales_in_cents + box_office_sales_in_cents;

		totals.totalCompsCount += comp_sale_count;
		totals.totalSoldCount += total_sold_count;
		totals.totalBoxOfficeCount += box_office_sale_count;

		totals.totalSoldOnlineCount += online_sale_count;
		totals.totalGross += total_sold_in_cents;
	});
	return totals;
};

class TicketCountReport {
	@observable
	countAndSalesData = {
		name: "Loading",
		counts: [],
		sales: []
	};

	@action
	fetchCountAndSalesData(queryParams, includeZeroCountTicketPricings = false) {
		if (!user.isAuthenticated) {
			this.resetCountAndSalesData();
			return;
		}
		return Bigneon()
			.reports.ticketCount({
				...queryParams
			})
			.then(response => {
				const sales = response.data.sales.filter(item => includeZeroCountTicketPricings || (item.online_sale_count + item.box_office_sale_count + item.comp_sale_count) > 0 );
				this.setCountAndSalesData(response.data.counts, sales);
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading counts failed."
				});
			});

	}

	@computed
	get countsAndSalesByEventId() {
		const result = {};
		const eventIds = (this.countAndSalesData.counts || []).concat(this.countAndSalesData.sales || []).map(item => item.event_id).sort();
		eventIds.forEach(eventId => {
			if (!result.hasOwnProperty(eventId)) {
				result[eventId] = {
					name: "No Data",
					counts: this.countAndSalesData.counts.filter(row => row.event_id === eventId),
					sales: this.countAndSalesData.sales.filter(row => row.event_id === eventId)
				};
				result[eventId].name = (result[eventId].counts.length && result[eventId].counts[0].event_name) || "No Data";
			}
		});
		return result;
	}

	setCountAndSalesData(counts = [], sales = []) {
		this.countAndSalesData = {
			name: "Loading",
			counts: countsRows(counts),
			sales: salesRows(sales)
		};
	}

	countsAndSalesByTicketPricing(eventData) {
		if (!eventData) {
			return false;
		}
		const { name, counts = [], sales = [] } = eventData;

		const result = {
			eventName: name,
			tickets: {},
			totals: combineTotals(counts, sales)
		};

		const ticketTypeIds = counts.concat(sales).map(item => item.ticket_type_id);
		ticketTypeIds.forEach(ticketTypeId => {
			if (!result.tickets.hasOwnProperty(ticketTypeId)) {
				const ticketTypeCounts = counts.filter(item => item.ticket_type_id === ticketTypeId);
				const ticketTypeSales = sales.filter(item => item.ticket_type_id === ticketTypeId);
				const name = (ticketTypeCounts.length && ticketTypeCounts[0].ticket_name) || "No Data";
				result.tickets[ticketTypeId] = {
					name,
					counts: ticketTypeCounts,
					sales: ticketTypeSales,
					totals: combineTotals(ticketTypeCounts, ticketTypeSales)
				};
			}
		});
		return result;
	}

	csv(ticketCounts) {
		const csvRows = [];
		csvRows.push(["Ticket Counts Reports"]);
		csvRows.push([
			"Event Name",
			"Ticket",
			"Allocation",
			"QTY Sold Online",
			"QTY Sold BO",
			"Total sold",
			"Comps",
			"Holds",
			"In Cart",
			"Open",
			"Gross"
		]);
		const {
			totalAllocation = 0,
			totalSoldOnlineCount = 0,
			totalBoxOfficeCount = 0,
			totalSoldCount = 0,
			totalCompsCount = 0,
			totalHoldsCount = 0,
			totalOpenCount = 0,
			totalReservedCount,
			totalGross = 0
		} = ticketCounts.totals || {};

		const { eventName, tickets } = ticketCounts;
		const ticketTypeIds = Object.keys(tickets);
		ticketTypeIds.map((ticketTypeId, index) => {
			const ticketData = tickets[ticketTypeId];
			const { name, totals, sales } = ticketData;
			const {
				totalAllocation,
				totalBoxOfficeCount,
				totalCompsCount,
				totalGross,
				totalHoldsCount,
				totalOpenCount,
				totalReservedCount,
				totalSoldCount,
				totalSoldOnlineCount
			} = totals;

			csvRows.push([
				eventName,
				name,
				totalAllocation,
				totalSoldOnlineCount,
				totalBoxOfficeCount,
				totalSoldCount,
				totalCompsCount,
				totalHoldsCount,
				totalReservedCount,
				totalOpenCount,
				dollars(totalGross)
			]);
		});

		csvRows.push([
			" ",
			"Totals",
			totalAllocation,
			totalSoldOnlineCount,
			totalBoxOfficeCount,
			totalSoldCount,
			totalCompsCount,
			totalHoldsCount,
			totalReservedCount,
			totalOpenCount,
			dollars(totalGross)
		]);
		return csvRows;
	}
}

const ticketCountReport = new TicketCountReport();
export default ticketCountReport;