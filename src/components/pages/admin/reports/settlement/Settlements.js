import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
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
			resultsLoaded: false
		};
	}

	componentDidMount() {
		setTimeout(this.refreshData.bind(this), 1000);//TODO remove after testing
	}

	componentWillUnmount() {
		settlementReport.setCountAndSalesData();
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
		const { eventDetails, dataByPrice } = settlementReport;

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

		return reportEventIds.map((reportEventId, index) => {
			let displayStartDate = "";
			let venue = "";
			if (eventDetails[reportEventId]) {
				displayStartDate = eventDetails[reportEventId].displayStartDate;
				venue = eventDetails[reportEventId].venue;
			}

			return <SingleEventSettlement key={index} venue={venue} displayStartDate={displayStartDate} {...dataByPrice[reportEventId]}/>;
		});
	}

	render() {
		return (
			<div>
				<div
					style={{
						display: "flex",
						minHeight: 60,
						alignItems: "center"
					}}
				>
					<Typography variant="title">Weekly event settlement</Typography>
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
