import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import { dollars } from "../../../../../helpers/money";
import SummaryAuditRow from "./SummaryAuditRow";

export const SUMMARY_AUDIT_HEADINGS = [
	"Ticket",
	"Face",
	"Qty sold online",
	"Qty sold BO",
	"Total sold",
	"Total comps",
	"Total face"
];

const styles = theme => {
	return {
		root: {}
	};
};

const SummaryAudit = props => {
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
			<SummaryAuditRow heading>{SUMMARY_AUDIT_HEADINGS}</SummaryAuditRow>

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
						<SummaryAuditRow ticketTypeRow gray>
							{[
								name,
								" ",
								online_count,
								box_office_count,
								total_sold,
								comp_count,
								dollars(total_face_value_in_cents)
							]}
						</SummaryAuditRow>

						{pricePoints.map((pricePoint, priceIndex) => {
							let rowName = pricePoint.pricing_name;
							if (pricePoint.hold_name) {
								rowName = (pricePoint.promo_redemption_code ? "Promo - " : "Hold - ") + pricePoint.hold_name;
							}

							return (
								<SummaryAuditRow key={priceIndex}>
									{[
										rowName,
										dollars(pricePoint.price_in_cents),
										pricePoint.online_count,
										pricePoint.box_office_count,
										pricePoint.total_sold,
										pricePoint.comp_count,
										dollars(pricePoint.total_face_value_in_cents)
									]}
								</SummaryAuditRow>
							);
						})}
					</div>
				);
			})}

			<SummaryAuditRow ticketTypeRow total>
				{[
					"Total sales",
					" ",
					totalOnlineCount,
					totalBoxOfficeCount,
					totalSoldCount,
					totalCompCount,
					dollars(totalSalesValueInCents)
				]}
			</SummaryAuditRow>
		</div>
	);
};

SummaryAudit.propTypes = {
	classes: PropTypes.object.isRequired,
	salesTotals: PropTypes.object.isRequired,
	eventSales: PropTypes.object.isRequired

};

export const SummaryAuditTable = withStyles(styles)(SummaryAudit);
