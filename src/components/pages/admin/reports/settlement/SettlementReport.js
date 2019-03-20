import React, { Component } from "react";
import { InputAdornment, Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ReportsDate from "../ReportDate";
import Loader from "../../../../elements/loaders/Loader";
import Bigneon from "../../../../../helpers/bigneon";
import settlementReport from "../../../../../stores/reports/settlementReport";
import SingleEventSettlement from "../settlement/SingleEventSettlement";
import GrandTotalsTable from "./GrandTotalsTable";
import reportDateRangeHeading from "../../../../../helpers/reportDateRangeHeading";
import Dialog from "../../../../elements/Dialog";
import InputGroup from "../../../../common/form/InputGroup";
import EventListTable from "./EventListTable";
import user from "../../../../../stores/user";
import Card from "../../../../elements/Card";
import getUrlParam from "../../../../../helpers/getUrlParam";
import moment from "moment-timezone";

const styles = theme => ({
	root: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit
	},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	},
	settleEventsContainer: {
		display: "flex",
		justifyContent: "flex-end",
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2
	}
});

@observer
class SettlementReport extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isViewOnlyReport: null,
			resultsLoaded: false,
			showAdjustmentDialog: false,
			adjustmentEditDollarValue: "",
			adjustmentEditNotes: ""
		};
	}

	componentDidMount() {
		const { history } = this.props;

		console.log(history);
		
		//If we have an ID, load those details instead of allowing them to set dates
		const id = getUrlParam("id");

		if (id) {
			//Don't have a find function at the moment
			Bigneon().organizations.settlements
				.index({ organization_id: this.props.organizationId })
				.then(response => {
					const { data } = response.data;

					let settlementReport = null;

					data.forEach((report) => {
						if (report.id) {
							settlementReport = report;
						}
					});

					if (settlementReport) {
						this.setState({ isViewOnlyReport: true });
					} else {
						notifications.show({
							message: "Settlement report not found.",
							variant: "error"
						});
					}
				})
				.catch(error => {
					console.error(error);
					notifications.showFromErrorResponse({
						error,
						defaultMessage: "Loading settlement report failed."
					});
				});

		} else {
			//We're creating a report
			this.setState({ isViewOnlyReport: false });
		}
	}

	componentWillUnmount() {
		settlementReport.setCountAndSalesData();
	}

	showAdjustmentDialog() {
		const { adjustmentsInCents, adjustmentNotes } = settlementReport;

		this.setState({
			adjustmentEditDollarValue: adjustmentsInCents ? `${(adjustmentsInCents / 100).toFixed(2)}` : "",
			adjustmentEditNotes: adjustmentNotes || "",
			showAdjustmentDialog: true
		});
	}

	closeAdjustmentDialog() {
		this.setState({ showAdjustmentDialog: false });
	}

	onSetAdjustments() {
		const { adjustmentEditDollarValue, adjustmentEditNotes } = this.state;

		if (isNaN(adjustmentEditDollarValue)) {
			return notifications.show({ message: "Invalid adjustment number.", variant: "warning" });
		}

		settlementReport.setAdjustmentDetails(Math.round(Number(adjustmentEditDollarValue) * 100), adjustmentEditNotes);

		this.closeAdjustmentDialog();
	}

	onSettleEvents() {
		const { adjustmentsInCents, adjustmentNotes, eventDetails } = settlementReport;
		const { start_utc, end_utc } = this.state;
		const event_id = Object.keys(eventDetails)[0];

		const params = {
			organization_id: user.currentOrganizationId,
			start_utc,
			end_utc,
			adjustments: [{
				comment: adjustmentNotes,
				value_in_cents: adjustmentsInCents,
				transaction_type: "Manual",
				event_id //TODO move adjustments to event level not grand totals
			}], //TODO allow for multiple adjustments later
			comment: adjustmentNotes
		};

		Bigneon().organizations.settlements.create(params)
			.then(() => {
				notifications.show({
					message: "Settlement report created.",
					variant: "success"
				});

				this.props.history.push("/admin/reports/settlement-list");
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to create settlement report."
				});
			});
	}

	refreshData(dataParams = { start_utc: null, end_utc: null, startDate: null, endDate: null }) {
		const { startDate, endDate, start_utc, end_utc } = dataParams;

		this.setState({ startDate, endDate, start_utc, end_utc, events: null });

		const { organizationId, onLoad } = this.props;
		const queryParams = { organization_id: organizationId, start_utc, end_utc, only_finished_events: false };

		settlementReport.fetchCountAndSalesData(queryParams, () => {
			onLoad ? onLoad() : null;
			this.setState({ resultsLoaded: true });
		});
	}

	renderResults() {
		const {
			eventDetails,
			dataByPrice,
			adjustmentsInCents,
			adjustmentNotes,
			grandTotals
		} = settlementReport;

		if (dataByPrice === null || settlementReport.isLoading) {
			return <Loader/>;
		}

		if (!this.state.resultsLoaded) {
			return null;
		}
		
		const reportEventIds = Object.keys(dataByPrice);

		if (reportEventIds.length === 0) {
			return <Typography>No events found.</Typography>;
		}

		const { classes } = this.props;
		const { startDate, endDate } = this.state;

		return (
			<div>
				<GrandTotalsTable
					{...grandTotals}
					adjustmentsInCents={adjustmentsInCents}
					adjustmentNotes={adjustmentNotes}
					onEditAdjustments={this.showAdjustmentDialog.bind(this)}
				/>

				<Typography className={classes.subHeading} style={{ marginBottom: 10 }}>
					Events ending from {reportDateRangeHeading(startDate, endDate)}
				</Typography>

				<EventListTable eventDetails={eventDetails}/>

				<div className={classes.settleEventsContainer}>
					<Button
						onClick={this.onSettleEvents.bind(this)}
						variant="callToAction"
					>
					Settle events
					</Button>
				</div>

				<div style={{ marginBottom: 40 }}/>

				{reportEventIds.map((reportEventId, index) => {
					let displayStartDate = "";
					let venueName = "";
					if (eventDetails[reportEventId]) {
						displayStartDate = eventDetails[reportEventId].displayStartDate;
						venueName = eventDetails[reportEventId].venueName;
					}

					return <SingleEventSettlement key={index} venueName={venueName} displayStartDate={displayStartDate} {...dataByPrice[reportEventId]}/>;
				})}
			</div>
		);
	}

	renderAdjustmentDialog() {
		const { showAdjustmentDialog, adjustmentEditDollarValue, adjustmentEditNotes } = this.state;

		return (
			<Dialog
				open={showAdjustmentDialog}
				title={"Edit total adjustments"}
				onClose={this.closeAdjustmentDialog.bind(this)}
			>
				<InputGroup
					name="settlement-adjustment-value"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">$</InputAdornment>
						)
					}}
					label={"Adjustment amount ($)"}
					type="text"
					placeholder="0.00"
					value={adjustmentEditDollarValue}
					onChange={e => this.setState({ adjustmentEditDollarValue: e.target.value })}
				/>

				<InputGroup
					value={adjustmentEditNotes}
					name="settlement-adjustment-notes"
					label="Adjustment notes"
					type="text"
					placeholder="Describe these adjustments"
					onChange={e => this.setState({ adjustmentEditNotes: e.target.value })}
					multiline
				/>

				<div style={{ display: "flex" }}>
					<Button style={{ flex: 1, marginRight: 5 }} onClick={this.closeAdjustmentDialog.bind(this)}>Cancel</Button>
					<Button style={{ flex: 1, marginLeft: 5 }} variant="callToAction" onClick={this.onSetAdjustments.bind(this)}>Update</Button>
				</div>
			</Dialog>
		);
	}

	render() {
		const { classes } = this.props;
		const { isViewOnlyReport } = this.state;

		if (isViewOnlyReport === null) {
			return <Loader/>;
		}

		return (
			<Card variant={"block"}>
				<div className={classes.root}>
					{this.renderAdjustmentDialog()}
					<div
						style={{
							display: "flex",
							minHeight: 40,
							alignItems: "center"
						}}
					>
						<Typography variant="title">Event settlement report</Typography>
						{/*<Typography className={classes.subHeading}>Sales occurring {dateRangeString(startDate, endDate)}</Typography>*/}

						<span style={{ flex: 1 }}/>
						<Button
							iconUrl="/icons/csv-active.svg"
							variant="text"
							onClick={() => {}}
						>
						Export CSV
						</Button>
					</div>

					{!isViewOnlyReport ? (
						<div>
							<ReportsDate defaultStartDaysBack={7} onChange={this.refreshData.bind(this)} onChangeButton/>
						</div>
					) : null}

					{this.renderResults()}
				</div>
			</Card>
		);
	}
}

SettlementReport.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	onLoad: PropTypes.func,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(SettlementReport);
