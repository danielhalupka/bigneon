import React, { Component } from "react";
import { InputAdornment, Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import { observer } from "mobx-react";

import Button from "../../../../elements/Button";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import notifications from "../../../../../stores/notifications";
import downloadCSV from "../../../../../helpers/downloadCSV";
import ReportsDate from "../ReportDate";
import Loader from "../../../../elements/loaders/Loader";
import Bigneon from "../../../../../helpers/bigneon";
import settlementReport from "../../../../../stores/reports/settlementReport";
import EventTicketCountTable from "../counts/TicketCounts";
import Divider from "../../../../common/Divider";
import SingleEventSettlement from "../settlement/SingleEventSettlement";
import GrandTotalsTable from "./GrandTotalsTable";
import reportDateRangeHeading from "../../../../../helpers/reportDateRangeHeading";
import Dialog from "../../../../elements/Dialog";
import InputGroup from "../../../../common/form/InputGroup";

const styles = theme => ({
	root: {},
	subHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3
	}
});

@observer
class Settlements extends Component {
	constructor(props) {
		super(props);

		this.state = {
			resultsLoaded: false,
			showAdjustmentDialog: false,
			adjustmentEditDollarValue: "",
			adjustmentEditNotes: ""
		};
	}

	componentDidMount() {
		//TODO remove after testing
		if (window.location.hostname === "localhost") {
			setTimeout(this.refreshData.bind(this), 1000);
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

	refreshData(dataParams = { start_utc: null, end_utc: null, startDate: null, endDate: null }) {
		const { startDate, endDate, start_utc, end_utc } = dataParams;

		this.setState({ startDate, endDate, events: null });

		const { organizationId, onLoad } = this.props;
		const queryParams = { organization_id: organizationId, start_utc, end_utc };

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

				<div style={{ marginBottom: 40 }}/>

				{reportEventIds.map((reportEventId, index) => {
					let displayStartDate = "";
					let venue = "";
					if (eventDetails[reportEventId]) {
						displayStartDate = eventDetails[reportEventId].displayStartDate;
						venue = eventDetails[reportEventId].venue;
					}

					return <SingleEventSettlement key={index} venue={venue} displayStartDate={displayStartDate} {...dataByPrice[reportEventId]}/>;
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
		return (
			<div>
				{this.renderAdjustmentDialog()}
				<div
					style={{
						display: "flex",
						minHeight: 60,
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
				<div>
					<ReportsDate defaultStartDaysBack={7} onChange={this.refreshData.bind(this)} onChangeButton/>
				</div>

				{this.renderResults()}
			</div>
		);
	}
}

Settlements.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	onLoad: PropTypes.func
};

export default withStyles(styles)(Settlements);
