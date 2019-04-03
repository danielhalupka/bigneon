import React, { Component } from "react";
import { Grid, Typography, withStyles } from "@material-ui/core";
import moment from "moment-timezone";

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

const URL_DATE_FORMAT = moment.HTML5_FMT.DATETIME_LOCAL_MS;

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
		const { timezone } = this.props;

		const fromString = getUrlParam("start_utc") || "";
		const toString = getUrlParam("end_utc") || "";

		let startDate = null;
		let endDate = null;

		if (fromString) {
			startDate =  moment.utc(fromString, URL_DATE_FORMAT).tz(timezone);
			if (!startDate.isValid()) {
				startDate = null;
			}
		}

		if (toString) {
			endDate =  moment.utc(toString, URL_DATE_FORMAT).tz(timezone);
			if (!endDate.isValid()) {
				endDate = null;
			}
		}

		if (startDate === null && endDate === null) {
			const { defaultStartTimeBeforeNow } = this.props;
			//Used for weekly settlement reports to default dates to be for the past week
			if (defaultStartTimeBeforeNow) {
				startDate = moment.utc().subtract(defaultStartTimeBeforeNow.value, defaultStartTimeBeforeNow.unit).tz(timezone);
				endDate = moment.utc().tz(timezone);
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

			//Inclusive of whole days
			const startOfStartDate = startDate.startOf("day");
			const endOfEndDate = endDate.endOf("day");

			const start_utc = moment.utc(startOfStartDate).format(URL_DATE_FORMAT);
			const end_utc = moment.utc(endOfEndDate).format(URL_DATE_FORMAT);

			changeUrlParam("start_utc", start_utc);
			changeUrlParam("end_utc", end_utc);

			callBack({
				startDate: startOfStartDate,
				endDate: endOfEndDate,
				start_utc: moment.utc(startOfStartDate).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
				end_utc: moment.utc(endOfEndDate).format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
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
		const { classes, onChangeButton, timezone } = this.props;
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
	defaultStartTimeBeforeNow: { value: 7, unit: "d" }
};

ReportsDate.propTypes = {
	classes: PropTypes.object.isRequired,
	timezone: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	defaultStartTimeBeforeNow: PropTypes.shape({
		value: PropTypes.number.isRequired,
		unit: PropTypes.oneOf(["M", "d"])
	}), //Pass this through for reports like weekly settlements that needs to be the past week by default
	onChangeButton: PropTypes.bool //Pass this through if you want onChange to be called here and not automatically when the date is changed
};

export default withStyles(styles)(ReportsDate);
