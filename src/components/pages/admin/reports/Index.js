import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import user from "../../../../stores/user";

import PageHeading from "../../../elements/PageHeading";
import Card from "../../../elements/Card";
import StyledLink from "../../../elements/StyledLink";
import Divider from "../../../common/Divider";
import Transactions from "./transactions/Transactions";
import TicketCounts from "./counts/TicketCounts";

const styles = theme => ({
	content: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit
	},
	menuContainer: {
		display: "flex",
		marginBottom: theme.spacing.unit * 2
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	}
});

@observer
class Reports extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	renderMenu() {
		const { classes } = this.props;

		const report = this.props.match.params.report;
		const { hasTransactionReports, hasTicketCountReports } = user;

		return (
			<div className={classes.menuContainer}>
				{hasTicketCountReports ? (
					<Typography className={classes.menuText}>
						<StyledLink
							underlined={!report || report === "ticket-counts"}
							to={`/admin/reports/ticket-counts`}
						>
							Ticket Counts
						</StyledLink>
					</Typography>
				) : null}

				{hasTransactionReports ? (
					<Typography className={classes.menuText}>
						<StyledLink
							underlined={report === "transaction-details"}
							to={`/admin/reports/transaction-details`}
						>
							Transaction Detail
						</StyledLink>
					</Typography>
				) : null}

				<Typography className={classes.menuText}>
					<StyledLink
						underlined={report === "box-office"}
						to={`/admin/reports/box-office`}
					>
						Box Office Sales
					</StyledLink>
				</Typography>
				<Typography className={classes.menuText}>
					<StyledLink
						underlined={report === "reconciliation"}
						to={`/admin/reports/reconciliation`}
					>
						Reconciliation
					</StyledLink>
				</Typography>
				<Typography className={classes.menuText}>
					<StyledLink
						underlined={report === "weekly-event-settlement"}
						to={`/admin/reports/weekly-event-settlement`}
					>
						Weekly Event Settlement
					</StyledLink>
				</Typography>
			</div>
		);
	}

	renderContent() {
		const report = this.props.match.params.report;
		const organizationId = user.currentOrganizationId;

		if (!organizationId) {
			return <Typography>Loading...</Typography>;
		}

		const { hasTransactionReports, hasTicketCountReports } = user;

		//Add report components here as needed
		switch (report) {
			case undefined:
			case "ticket-counts":
				return hasTicketCountReports ? (
					<TicketCounts organizationId={organizationId} />
				) : null;
			case "transaction-details":
				return <Transactions organizationId={organizationId} />;
			default:
				return (
					<Typography>
						This report is not yet available for your organization.
					</Typography>
				);
		}
	}

	render() {
		const { classes } = this.props;

		return (
			<div>
				<PageHeading>Organization Reports</PageHeading>

				<Card>
					<div className={classes.content}>
						{this.renderMenu()}
						<Divider style={{ marginBottom: 10 }} />

						{this.renderContent()}
					</div>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Reports);
