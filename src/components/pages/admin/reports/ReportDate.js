import React, { Component } from "react";
import { Grid, Typography, withStyles } from "@material-ui/core";
import moment from "moment";

import Divider from "../../../common/Divider";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";
import { fontFamilyDemiBold } from "../../../styles/theme";
import changeUrlParam from "../../../../helpers/changeUrlParam";
import PropTypes from "prop-types";
import Button from "../../../elements/Button";
import getUrlParam from "../../../../helpers/getUrlParam";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit * 4
	},
	innerRow: {
		paddingTop: theme.spacing.unit * 2
	},
	titleContainer: {
		display: "flex"
	},
	title: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2,
		paddingTop: 2
		//lineHeight: 0
	},
	icon: {
		width: "auto",
		height: 25,
		marginRight: theme.spacing.unit
	}
});

const URL_DATE_FORMAT = "MM-DD-YYYY";

class ReportsDate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate: null,
			endDate: null,
			errors: {}
		};
	}

	componentDidMount() {
		const fromString = getUrlParam("start_utc") || "";
		const toString = getUrlParam("end_utc") || "";

		let startDate = null;
		let endDate = null;

		if (fromString) {
			startDate =  moment(fromString, URL_DATE_FORMAT);
			if (!startDate.isValid()) {
				startDate = null;
			}
		}

		if (toString) {
			endDate =  moment(toString, URL_DATE_FORMAT);
			if (!endDate.isValid()) {
				endDate = null;
			}
		}

		if (startDate === null && endDate === null) {
			const { defaultStartDaysBack } = this.props;
			//Used for weekly settlement reports to default dates to be for the past week
			if (defaultStartDaysBack) {
				startDate = moment().subtract(defaultStartDaysBack, "d");
				endDate = moment();
			}
		}

		this.setState({ startDate, endDate }, this.onDateChange.bind(this));
	}

	onChange(callBack = () => {}) {
		const { startDate, endDate } = this.state;
		if (startDate && endDate) {
			if (endDate.isBefore(startDate)) {
				return this.setState({ errors: { startDate: "From date needs to be before to date." } });
			}

			changeUrlParam("start_utc", startDate.format(URL_DATE_FORMAT));
			changeUrlParam("end_utc", endDate.format(URL_DATE_FORMAT));

			//Inclusive of whole days
			const startOfStartDate = startDate.startOf("day");
			const endOfEndDate = endDate.endOf("day");

			callBack({
				startDate: startOfStartDate,
				endDate: endOfEndDate,
				start_utc: startOfStartDate.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
				end_utc: endOfEndDate.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
			});
		} else if (!startDate && !endDate) {
			callBack();
		}
		
	}

	onDateChange() {
		const { onChange, onChangeButton } = this.props;
		if (!onChangeButton) {
			this.onChange(onChange);
		} else {
			this.onChange();
		}
	}

	render() {
		const { classes, onChangeButton } = this.props;
		const { startDate, endDate, errors } = this.state;

		let columnSizes = [
			{ xs: 12, sm: 4, lg: 6 },
			{ xs: 12, sm: 4, lg: 3 },
			{ xs: 12, sm: 4, lg: 3 }
		];

		if (onChangeButton) {
			columnSizes = [
				{ xs: 12, sm: 3, lg: 3 },
				{ xs: 12, sm: 3, lg: 3 },
				{ xs: 12, sm: 3, lg: 3 },
				{ xs: 12, sm: 3, lg: 3 }
			];
		}

		return (
			<div className={classes.root}>
				<Divider/>

				<Grid
					alignItems="center"
					container
					spacing={24}
					className={classes.innerRow}
				>
					<Grid
						item
						className={classes.titleContainer}
						{...columnSizes[0]}
					>
						<img alt={"Report date"} src="/icons/events-active.svg" className={classes.icon}/>
						<Typography className={classes.title}>
							Set report date
						</Typography>
					</Grid>
					<Grid
						item
						{...columnSizes[1]}
					>
						<DateTimePickerGroup
							error={errors.startDate}
							type="date"
							value={startDate}
							name="startDate"
							label="From"
							onChange={startDate => {
								this.setState({ startDate }, this.onDateChange.bind(this));
							}}
						/>
					</Grid>
					<Grid
						item
						{...columnSizes[2]}
					>
						<DateTimePickerGroup
							error={errors.endDate}
							type="date"
							value={endDate}
							name="endDate"
							label="To"
							onChange={endDate => {
								this.setState({ endDate }, this.onDateChange.bind(this));
							}}
						/>
					</Grid>

					{onChangeButton ? (
						<Grid
							item
							{...columnSizes[3]}
						>
							<Button
								style={{ width: "100%" }}
								onClick={() => {
									this.onChange(this.props.onChange);
								}}
								variant="callToAction"
							>
								Generate report
							</Button>
						</Grid>
					) : null
					}
				</Grid>
				<Divider/>
			</div>
		);
	}
}

ReportsDate.defaultProps = {
	defaultStartDaysBack: 7
};

ReportsDate.propTypes = {
	classes: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	defaultStartDaysBack: PropTypes.number, //Pass this through for reports like weekly settlements that needs to be the past week by default
	onChangeButton: PropTypes.bool //Pass this through if you want onChange to be called here and not automatically when the date is changed
};

export default withStyles(styles)(ReportsDate);
