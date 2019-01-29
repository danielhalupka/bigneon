import React, { Component } from "react";
import { Grid, Typography, withStyles } from "@material-ui/core";
import moment from "moment";

import Divider from "../../../common/Divider";
import DateTimePickerGroup from "../../../common/form/DateTimePickerGroup";
import { fontFamilyDemiBold } from "../../../styles/theme";
import changeUrlParam from "../../../../helpers/changeUrlParam";
import PropTypes from "prop-types";

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
		const url = new URL(window.location.href);
		const fromString = url.searchParams.get("start") || "";
		const toString = url.searchParams.get("end") || "";

		let startDate = null;
		let endDate = null;

		if (fromString) {
			startDate =  moment(fromString, URL_DATE_FORMAT);
			if (startDate.isValid()) {
				this.setState({ startDate });
			}
		}

		if (toString) {
			endDate =  moment(toString, URL_DATE_FORMAT);
			if (endDate.isValid()) {
				this.setState({ endDate });
			}
		}

		this.setState({ startDate, endDate }, this.onChange.bind(this));
	}

	onChange() {
		const { onChange } = this.props;
		if (onChange) {
			const { startDate, endDate } = this.state;
			if (startDate && endDate) {
				if (endDate.isBefore(startDate)) {
					return this.setState({ errors: { startDate: "From date needs to be before to date." } });
				}

				changeUrlParam("start", startDate.format(URL_DATE_FORMAT));
				changeUrlParam("end", endDate.format(URL_DATE_FORMAT));

				//Inclusive of whole days
				const startOfStartDate = startDate.startOf("day");
				const endOfEndDate = endDate.endOf("day");

				onChange({
					startDate: startOfStartDate,
					endDate: endOfEndDate,
					start_utc: moment
						.utc(startOfStartDate)
						.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
					end_utc: moment
						.utc(endOfEndDate)
						.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
				}
				);
			} else if (!startDate && !endDate) {
				onChange();
			}
		}
	}

	render() {
		const { classes } = this.props;
		const { startDate, endDate, errors } = this.state;

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
						xs={12}
						sm={4}
						lg={6}
						className={classes.titleContainer}
					>
						<img alt={"Report date"} src="/icons/events-active.svg" className={classes.icon}/>
						<Typography className={classes.title}>
							Set report date
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}
						lg={3}
					>
						<DateTimePickerGroup
							error={errors.startDate}
							type="date"
							value={startDate}
							name="startDate"
							label="From"
							onChange={startDate => {
								this.setState({ startDate }, this.onChange.bind(this));
							}}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}
						lg={3}
					>
						<DateTimePickerGroup
							error={errors.endDate}
							type="date"
							value={endDate}
							name="endDate"
							label="To"
							onChange={endDate => {
								this.setState({ endDate }, this.onChange.bind(this));
							}}
						/>
					</Grid>
				</Grid>
				<Divider/>
			</div>
		);
	}
}

ReportsDate.propTypes = {
	classes: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(ReportsDate);
