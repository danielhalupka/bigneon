import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import { fontFamilyDemiBold } from "../../styles/theme";
import Card from "../Card";

const chartHeight = 100;

const styles = theme => ({
	root: {
		flex: 1,
		padding: theme.spacing.unit * 2,
		height: chartHeight + 150
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		margin: theme.spacing.unit * 2
	},
	name: {
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase"
	},
	chartBackground: {
		paddingTop: theme.spacing.unit * 2,
		height: chartHeight,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between"
	},
	horizontalLine: {
		borderTop: "1px solid",
		borderColor: "#9da3b4",
		opacity: 0.5
	},
	chartOverlay: {
		position: "relative",
		top: -chartHeight
	},
	barsContainer: {
		display: "flex",
		justifyContent: "space-around"
	},
	labelsContainer: {
		marginTop: theme.spacing.unit,
		display: "flex",
		justifyContent: "space-around"
	},
	totalLabel: {
		fontSize: theme.typography.fontSize * 0.85,
		color: "#9da3b4"
	},
	totalRevenue: {
		fontSize: theme.typography.fontSize * 0.8
	},
	bar: {
		width: 30,
		borderRadius: "30px 30px 0px 0px"
	}
});

const colors = ["#707ced", "#afc6d4", "#ff22b2"];

const Label = ({ children, value, classes }) => (
	<div>
		<Typography className={classes.totalLabel}>{children}</Typography>
		<Typography className={classes.totalValue}>{value}</Typography>
	</div>
);

const Bar = ({ classes, value, maxValue, index }) => {
	const height = (value / maxValue) * chartHeight;
	const topSpace = chartHeight - height;
	return (
		<div
			className={classes.bar}
			style={{
				position: "relative",
				top: topSpace,
				height,
				backgroundColor: colors[index]
			}}
		/>
	);
};

const TicketTypeSalesBarChart = props => {
	const { name, totalRevenue, classes, values } = props;

	let maxValue = 0;
	values.forEach(({ value }) => {
		if (maxValue < value) {
			maxValue = value;
		}
	});

	return (
		<Card variant="subCard">
			<div className={classes.root}>
				<div className={classes.header}>
					<Typography className={classes.name}>{name}</Typography>
					<Typography
						className={classes.totalRevenue}
					>{`$${totalRevenue}`}</Typography>
				</div>
				<div className={classes.chartBackground}>
					<div className={classes.horizontalLine} />
					<div className={classes.horizontalLine} />
					<div className={classes.horizontalLine} />
					<div className={classes.horizontalLine} />
				</div>
				<div className={classes.chartOverlay}>
					<div className={classes.barsContainer}>
						{values.map(({ label, value }, index) => (
							<Bar
								key={index}
								value={value}
								maxValue={maxValue}
								index={index}
								classes={classes}
							/>
						))}
					</div>
					<div className={classes.labelsContainer}>
						{values.map(({ label, value }, index) => (
							<Label key={index} classes={classes} value={value}>
								{label}
							</Label>
						))}
					</div>
				</div>
			</div>
		</Card>
	);
};

TicketTypeSalesBarChart.propTypes = {
	classes: PropTypes.object.isRequired,
	name: PropTypes.string.isRequired,
	totalRevenue: PropTypes.number.isRequired,
	values: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.number.isRequired
		}).isRequired
	)
};

export default withStyles(styles)(TicketTypeSalesBarChart);
