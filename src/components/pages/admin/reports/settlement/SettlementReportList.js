import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import { observer } from "mobx-react";

import Button from "../../../../elements/Button";
import Card from "../../../../elements/Card";
import user from "../../../../../stores/user";
import Bigneon from "../../../../../helpers/bigneon";
import notifications from "../../../../../stores/notifications";
import Loader from "../../../../elements/loaders/Loader";
import reportDateRangeHeading from "../../../../../helpers/reportDateRangeHeading";
import { fontFamilyDemiBold } from "../../../../styles/theme";

const styles = theme => ({
	root: {},
	cardInnerContainer: {
		padding: theme.spacing.unit * 2,
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center"
	},
	createdDateText: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.1
	}
});

const Spacer = () => <div style={{ marginTop: 20 }}/>;

@observer
class SettlementReportList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			reports: null
		};
	}

	 componentDidMount() {
		const { organizationId, organizationTimezone } = this.props;
		const dateFormat = "dddd, MMMM Do YYYY z";

		Bigneon().organizations.settlements.index({ organization_id: organizationId })
			.then(response => {
				const { data, paging } = response.data; //TODO pagination
				const reports = [];

				data.forEach(({ created_at, start_time, end_time, ...rest }) => {
					const displayDateRange = reportDateRangeHeading(moment.utc(start_time).tz(organizationTimezone), moment.utc(end_time).tz(organizationTimezone));

					const createdAtMoment =  moment.utc(created_at).tz(organizationTimezone);

					reports.push({
						...rest,
						createdAtMoment,
						displayCreatedAt: createdAtMoment.format(dateFormat),
						displayDateRange
					});
				});

				reports.sort((a, b) => {
					if (a.createdAtMoment.diff(b.createdAtMoment) < 0) {
						return 1;
					} else {
						return -1;
					}
				});

				this.setState({ reports });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading settlement reports failed."
				});
			});
	 }

	renderProcessSettlementCard() {
		const { classes } = this.props;

		if (user.isAdmin) {
			return (
				<Card variant={"block"}>
					<div className={classes.cardInnerContainer}>
						<Link to={"/admin/reports/settlement"}>
							<Button variant="callToAction">Process settlement</Button>
						</Link>
					</div>
				</Card>
			);
		}
	}

	renderList() {
		const { reports } = this.state;
		if (reports === null) {
			return <Loader>Loading settlement reports...</Loader>;
		}

		const { classes } = this.props;

		return reports.map(report => {
			const { id, displayCreatedAt, displayDateRange  } = report;

			return (
				<div key={id}>
					<Link to={`/admin/reports/settlement?id=${id}`}>
						<Card variant={"block"}>
							<div className={classes.cardInnerContainer}>
								<div>
									<Typography className={classes.createdDateText}>{displayCreatedAt}</Typography>
									<Typography>Events ending {displayDateRange}</Typography>
								</div>
								<div>
									{/*icon icon icon*/}
								</div>
							</div>
						</Card>
					</Link>
					<Spacer/>
				</div>
			);
		});

	}

	render() {
		return (
			<div>
				{this.renderProcessSettlementCard()}

				<Spacer/>
				{this.renderList()}
			</div>
		);
	}
}

SettlementReportList.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired,
	organizationTimezone: PropTypes.string.isRequired
};

export default withStyles(styles)(SettlementReportList);
