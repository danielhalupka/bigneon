import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";

import EventSummaryRow from "./EventSummaryRow";

const dollars = cents => `$${(cents / 100).toFixed(2)}`;

export const EVENT_SALES_HEADINGS = [
	"Ticket",
	"Price",
	"Online",
	"Box office",
	"Total sold",
	"Comps",
	"Total value"
];

const styles = theme => {
	return {
		root: {
		}
	};
};

const EventSalesTableView = props => {
	const {
		classes,
		salesTotals,
		eventSales
	} = props;

	const {
		totalOnlineCount,
		totalBoxOfficeCount,
		totalSoldCount,
		totalCompCount,
		totalSalesValueInCents
	} = salesTotals;

	return (
		<div>
			<EventSummaryRow heading>{EVENT_SALES_HEADINGS}</EventSummaryRow>

			{Object.keys(eventSales).map((ticketId, index) => {
				const ticketSale = eventSales[ticketId];
				const { name, pricePoints, totals } = ticketSale;

				const {
					online_count,
					box_office_count,
					comp_count,
					total_sold,
					total_face_value_in_cents
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
								dollars(total_face_value_in_cents)
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
									dollars(pricePoint.total_face_value_in_cents)
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
};

EventSalesTableView.propTypes = {
	classes: PropTypes.object.isRequired,
	salesTotals: PropTypes.object.isRequired,
	eventSales: PropTypes.object.isRequired

};

export const EventSalesTable = withStyles(styles)(EventSalesTableView);
