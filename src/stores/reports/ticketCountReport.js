import { observable, computed, action, extendObservable } from "mobx";
import notifications from "../notifications";
import Bigneon from "../../helpers/bigneon";
import user from "../user";
import { dollars } from "../../helpers/money";

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
		totalGross: 0,
		totalOnlineClientFeesInCents: 0,
		totalBoxOfficeClientFeesInCents: 0,
		totalRedeemedCount: 0,
		totalOrdersOnline: 0,
		totalOrdersBoxOffice: 0,
		totalOrders: 0,
		faceAmountOwedToClientInCents: 0
	};
	counts.forEach(row => {
		const {
			allocation_count,
			available_for_purchase_count,
			reserved_count,
			comp_available_count,
			hold_available_count,
			redeemed_count
		} = row;

		const total_held_tickets = comp_available_count + hold_available_count;
		totals.totalAllocation += allocation_count;
		totals.totalHoldsCount += total_held_tickets;
		totals.totalOpenCount += available_for_purchase_count;
		totals.totalReservedCount += reserved_count;
		totals.totalRedeemedCount += redeemed_count;
	});

	sales.forEach(row => {
		const {
			online_sale_count,
			box_office_sale_count,
			online_sales_in_cents,
			box_office_sales_in_cents,
			comp_sale_count,
			client_online_fees_in_cents,
			box_office_order_count,
			online_order_count,
			client_box_office_fees_in_cents,
			company_box_office_fees_in_cents,
			company_online_fees_in_cents,
			total_online_fees_in_cents,
			total_box_office_fees_in_cents,
			total_sold_in_cents
		} = row;

		const total_sold_count = online_sale_count + box_office_sale_count;
		// const total_sold_in_cents = online_sales_in_cents + box_office_sales_in_cents;

		totals.totalOrdersOnline += online_order_count;
		totals.totalOrdersBoxOffice += box_office_order_count;
		totals.totalOrders += online_order_count + box_office_order_count;

		totals.totalCompsCount += comp_sale_count;
		totals.totalSoldCount += total_sold_count;
		totals.totalBoxOfficeCount += box_office_sale_count;

		totals.totalSoldOnlineCount += online_sale_count;
		totals.totalGross += total_sold_in_cents;
		totals.totalOnlineClientFeesInCents += client_online_fees_in_cents;
		totals.totalBoxOfficeClientFeesInCents += client_box_office_fees_in_cents;

		totals.faceAmountOwedToClientInCents += online_sales_in_cents; //TODO confirm correct value
	});
	return totals;
};

export class TicketCountReport {
	@observable
	countAndSalesData = {
		name: "Loading",
		counts: [],
		sales: []
	};

	@observable
	isLoading = false;

	@action
	fetchCountAndSalesData(queryParams, includeZeroCountTicketPricings = false, onSuccess) {
		this.setCountAndSalesData();

		if (!user.isAuthenticated) {
			return;
		}

		this.isLoading = true;

		return Bigneon().reports.ticketCount({ ...queryParams })
			.then(response => {
				const sales = response.data.sales.filter(item => includeZeroCountTicketPricings || (item.online_sale_count + item.box_office_sale_count + item.comp_sale_count) > 0);
				this.setCountAndSalesData(response.data.counts, sales);

				onSuccess ? onSuccess() : null;

				this.isLoading = false;
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading counts failed."
				});

				this.isLoading = false;
			});

	}

	setCountAndSalesData(counts = [], sales = []) {
		this.countAndSalesData = {
			name: "Loading",
			counts: countsRows(counts),
			sales: salesRows(sales)
		};
	}

	/**
	 * {eventId: {name: "", counts: [], sales: []}}
	 */
	@computed
	get countsAndSalesByEventId() {
		const results = {};
		const { counts, sales } = this.countAndSalesData;
		const eventIds = (counts || []).concat(sales || []).map(item => item.event_id).sort();
		eventIds.forEach(eventId => {
			if (!results.hasOwnProperty(eventId)) {
				results[eventId] = {
					name: "No Data",
					counts: this.countAndSalesData.counts.filter(row => row.event_id === eventId),
					sales: this.countAndSalesData.sales.filter(row => row.event_id === eventId)
				};
				results[eventId].name = (results[eventId].counts.length && results[eventId].counts[0].event_name) || "No Data";
			}
		});
		return results;
	}

	@computed
	get dataByTicketPricing() {
		const allEventData = this.countsAndSalesByEventId;
		const results = {};
		for (const eventId in allEventData) {
			const eventData = allEventData[eventId];
			const { name, counts = [], sales = [] } = eventData;

			const eventResult = {
				eventName: name,
				tickets: {},
				totals: combineTotals(counts, sales)
			};

			const ticketTypeIds = counts.concat(sales).map(item => item.ticket_type_id);
			ticketTypeIds.forEach(ticketTypeId => {
				if (!eventResult.tickets.hasOwnProperty(ticketTypeId)) {
					const ticketTypeCounts = counts.filter(item => item.ticket_type_id === ticketTypeId);
					const ticketTypeSales = sales.filter(item => item.ticket_type_id === ticketTypeId);
					const name = (ticketTypeCounts.length && ticketTypeCounts[0].ticket_name) || "No Data";
					eventResult.tickets[ticketTypeId] = {
						name,
						counts: ticketTypeCounts,
						sales: ticketTypeSales,
						totals: combineTotals(ticketTypeCounts, ticketTypeSales)
					};
				}
			});
			results[eventId] = eventResult;
		}

		return results;
	}

	@computed
	get dataByPrice() {
		//Need to break the link from the dataByTicketPricing Observable
		const allEventData = JSON.parse(JSON.stringify(this.dataByTicketPricing));
		const groupByPriceTallyKeys = [
			"box_office_sales_in_cents",
			"online_sales_in_cents",
			"box_office_refunded_count",
			"online_refunded_count",
			"box_office_sale_count",
			"online_sale_count",
			"comp_sale_count",
			"total_box_office_fees_in_cents",
			"total_online_fees_in_cents",
			"company_box_office_fees_in_cents",
			"client_box_office_fees_in_cents",
			"company_online_fees_in_cents",
			"client_online_fees_in_cents",
			"total_sold_count",
			"total_sold_in_cents"
		];
		for (const eventId in allEventData) {
			const { tickets } = allEventData[eventId];
			for (const ticketTypeId in tickets) {
				const ticketSalesPricing = tickets[ticketTypeId].sales;
				const tmpGroupByPrice = {};
				ticketSalesPricing.forEach(row => {
					const ticketPricingPriceInCents = row.ticket_pricing_price_in_cents;
					if (!tmpGroupByPrice.hasOwnProperty(ticketPricingPriceInCents)) {
						tmpGroupByPrice[ticketPricingPriceInCents] = row;
					} else {
						groupByPriceTallyKeys.forEach(key => {
							tmpGroupByPrice[ticketPricingPriceInCents][key] += row[key];
						});
					}
				});
				tickets[ticketTypeId].sales = [];
				Object.keys(tmpGroupByPrice).forEach(key => {
					tickets[ticketTypeId].sales.push(tmpGroupByPrice[key]);
				});
			}
		}

		return allEventData;
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