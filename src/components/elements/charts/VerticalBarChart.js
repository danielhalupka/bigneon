import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";

import { fontFamilyDemiBold } from "../../styles/theme";
import Tooltip from "../Tooltip";
import getScreenWidth from "../../../helpers/getScreenWidth";

const chartHeight = 200;

const yLabelSpace = 20;
const barWidth = 10;

const styles = theme => {
	return ({
		root: {
			flex: 1,
			padding: theme.spacing.unit * 2,
			height: chartHeight + 60,

			[theme.breakpoints.down("sm")]: {
				padding: 0
			}
		},
		chartContainer: {
			display: "flex",
			flexDirection: "column"
		},
		yLabelAndBars: {
			display: "flex"
		},
		chartFooter: {
			display: "flex",
			paddingTop: theme.spacing.unit * 2
		},
		xLabels: {
			flex: 1,
			marginLeft: yLabelSpace,
			display: "flex",
			justifyContent: "space-around"
		},
		yLabels: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between"
		},
		yLabelText: {
			fontFamily: fontFamilyDemiBold,
			color: "#9da3b4",
			fontSize: theme.typography.fontSize * 0.85
		},
		xLabelText: {
			width: barWidth * 2,
			textAlign: "center",
			fontFamily: fontFamilyDemiBold,
			color: "#9da3b4",
			fontSize: theme.typography.fontSize * 0.85
		},
		chartBackground: {
			flex: 1,
			height: chartHeight,
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between"
		},
		horizontalLine: {
			borderTop: "1px dashed",
			borderColor: "#9da3b4",
			opacity: 0.2,
			marginLeft: theme.spacing.unit * 2,
			marginRight: theme.spacing.unit * 2
		},
		chartOverlay: {
			position: "relative",
			top: -chartHeight - 35
		},
		barsContainer: {
			display: "flex",
			justifyContent: "space-around",
			marginLeft: yLabelSpace,
			[theme.breakpoints.down("sm")]: {
				//marginLeft: yLabelSpace
			}
		},
		bar: {
			width: barWidth,
			borderRadius: 10,
			cursor: "pointer",
			backgroundImage: "linear-gradient(to bottom, #e53d96, #5491cc)"
		}
	});
};

const Bar = ({ classes, value, maxValue, tooltipTitle, tooltipText, index }) => {
	const height = Math.round((value / maxValue) * chartHeight);
	const topSpace = chartHeight - height - 1;

	return (
		<Tooltip title={tooltipTitle} text={tooltipText}>
			<Grow in={true} timeout={index * 100}>
				<div
					className={classes.bar}
					style={{
						position: "relative",
						top: topSpace,
						height: height
					}}
				/>
			</Grow>
		</Tooltip>
	);
};

const VerticalBarChart = props => {
	const { classes } = props;

	let maxValue = 1;
	const xLabels = [];

	const xValueLength = props.values.length;
	let values = [...props.values];

	//If screen width is too small, only show last 10 values
	if (xValueLength > 10 && getScreenWidth() < 600) {
		values = values.splice(xValueLength - 10, xValueLength);
	}

	values.forEach(({ y, x }) => {
		if (maxValue < y) {
			maxValue = y;
		}

		xLabels.push(x);
	});

	//Round up to nearest 100
	maxValue = Math.ceil(maxValue / 100) * 100;

	const yLabels = [maxValue, 0];
	//TODO put points in between

	return (
		<div className={classes.root}>
			<div className={classes.chartContainer}>
				<div className={classes.yLabelAndBars}>
					<div
						className={classes.yLabels}
						style={{
							flexDirection: yLabels.length === 1 ? "flex-end" : "space-between"
						}}
					>
						{yLabels.map(label => (
							<Typography
								key={label}
								className={classes.yLabelText}
							>{`$${label}`}</Typography>
						))}
					</div>
					<div className={classes.chartBackground}>
						<div className={classes.horizontalLine}/>
						<div className={classes.horizontalLine}/>
						<div className={classes.horizontalLine}/>
						<div className={classes.horizontalLine}/>
					</div>
				</div>
				<div className={classes.chartFooter}>
					<div className={classes.xLabels}>
						{xLabels.map(label => (
							<Typography key={label} className={classes.xLabelText}>
								{label}
							</Typography>
						))}
					</div>
				</div>
				<div className={classes.chartOverlay}>
					<div className={classes.barsContainer}>
						{values.map(({ y, tooltipTitle, tooltipText }, index) => (
							<Bar
								key={index}
								value={y}
								maxValue={maxValue}
								index={index}
								classes={classes}
								tooltipTitle={tooltipTitle}
								tooltipText={tooltipText}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

VerticalBarChart.propTypes = {
	classes: PropTypes.object.isRequired,
	values: PropTypes.arrayOf(
		PropTypes.shape({
			x: PropTypes.number.isRequired,
			y: PropTypes.number.isRequired,
			tooltipTitle: PropTypes.string.isRequired,
			tooltipText: PropTypes.string.isRequired
		}).isRequired
	)
};

export default withStyles(styles)(VerticalBarChart);
