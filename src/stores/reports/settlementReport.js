import { action, computed, observable } from "mobx";
import { TicketCountReport } from "./ticketCountReport";
import React from "react";
import moment from "moment-timezone";

import Bigneon from "../../helpers/bigneon";
import notifications from "../notifications";
import user from "../user";

export class SettlementReport extends TicketCountReport {
	@observable
	eventDetails = {};

	@observable
	adjustmentsInCents = 0;

	@observable
	adjustmentNotes = "";

	@action
	setAdjustmentDetails(adjustmentsInCents, adjustmentNotes) {
		this.adjustmentsInCents = adjustmentsInCents;
		this.adjustmentNotes = adjustmentNotes;
	}

	@action
	fetchCountAndSalesData(queryParams, onSuccess) {
		const includeZeroCountTicketPricings = false;
		this.setCountAndSalesData();

		if (!user.isAuthenticated) {
			return;
		}

		this.isLoading = true;

		return Bigneon().organizations.settlements.prepare({ ...queryParams })
			.then(response => {
				const preparedSettlementReports = response.data;

				const { sales_per_event } = preparedSettlementReports;

				const mergedDate = {
					counts: [],
					sales: []
				};

				//Merging all event data into one array for sales and counts so it's compatible with TicketCountReport store
				Object.keys(sales_per_event).forEach(event_id => {
					const { counts, sales } = sales_per_event[event_id];

					mergedDate.counts = [...mergedDate.counts, ...counts];
					mergedDate.sales = [...mergedDate.sales, ...sales];
				});

				//const sales = response.data.sales.filter(item => includeZeroCountTicketPricings || (item.online_sale_count + item.box_office_sale_count + item.comp_sale_count) > 0);
				this.setCountAndSalesData(mergedDate.counts, mergedDate.sales);

				onSuccess ? onSuccess() : null;

				this.loadEventDetails();

				this.isLoading = false;
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading settlement data failed."
				});

				this.isLoading = false;
			});
	}

	@computed
	get grandTotals() {
		let totalFaceAmountOwedToClientInCents = 0;
		let totalServiceFeesRevenueShareInCents = 0;

		if (this.dataByPrice) {
			Object.keys(this.dataByPrice).forEach(event_id => {
				const { totals } = this.dataByPrice[event_id];
				const { faceAmountOwedToClientInCents, totalOnlineClientFeesInCents, totalBoxOfficeClientFeesInCents } = totals;
				totalFaceAmountOwedToClientInCents += faceAmountOwedToClientInCents;
				totalServiceFeesRevenueShareInCents += totalOnlineClientFeesInCents + totalBoxOfficeClientFeesInCents;

			});
		}

		const totalSettlementInCents = totalFaceAmountOwedToClientInCents + totalServiceFeesRevenueShareInCents + this.adjustmentsInCents;

		return { totalFaceAmountOwedToClientInCents, totalServiceFeesRevenueShareInCents, totalSettlementInCents };
	}

	async loadEventDetails() {
		const eventIds = [];
		const { counts } = this.countAndSalesData;
		if (counts) {
			counts.forEach((({ event_id }) => {
				if (eventIds.indexOf(event_id) < 0) {
					eventIds.push(event_id);
				}
			}));
		}

		for (let index = 0; index < eventIds.length; index++) {
			const id = eventIds[index];
			try {
				const result = await Bigneon().events.read({ id });
				if (result.data) {
					const { venue, ...event } = result.data;
					const { event_start, event_end } = event;
					const { timezone } = venue;
					const dateFormat = "dddd, MMMM Do YYYY z";

					this.setEventDetails(id, {
						eventName: event.name,
						venueName: venue.name,
						displayStartDate: moment.utc(event_start).tz(timezone).format(dateFormat),
						displayEndDate: moment.utc(event_end).tz(timezone).format(dateFormat)
					});
				}
			} catch(error) {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load event date and venue."
				});
			}

		}
	}

	setEventDetails(id, details = { displayStartDate: "", venue: "" }) {
		this.eventDetails[id] = details;
	}

}

const settlementReport = new SettlementReport();
export default settlementReport;