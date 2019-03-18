import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";
import { fontFamilyDemiBold, primaryHex } from "../../../../styles/theme";

const styles = theme => {
	return {
		root: {
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2,

			paddingTop: theme.spacing.unit,
			paddingBottom: theme.spacing.unit,

			display: "flex"
		},
		default: {},
		gray: {
			backgroundColor: "#f5f7fa"
		},
		heading: {
			backgroundColor: "#000000",
			borderTopLeftRadius: 8,
			borderTopRightRadius: 8
		},
		headingNoRadius: {
			backgroundColor: "#000000"
		},
		subHeading: {
			backgroundColor: "#f5f7fa",
			fontFamily: fontFamilyDemiBold
		},
		headingText: {
			fontSize: theme.typography.fontSize * 0.8,
			color: "#FFFFFF"
		},
		total: {
			backgroundColor: primaryHex,
			borderBottomLeftRadius: 8,
			borderBottomRightRadius: 8
		},
		totalNoRadius: {
			backgroundColor: primaryHex
		},
		totalText: {
			color: "#FFFFFF",
			borderRadius: 4,
			fontFamily: fontFamilyDemiBold
		},
		text: {
			fontSize: theme.typography.fontSize * 0.9
		}
	};
};

const EventSettlementRow = props => {
	const { heading, headingNoRadius, subHeading, gray, children, classes, total, totalNoRadius, ...rest } = props;

	const columnStyles = [
		{ flex: 2, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "right" }
	];

	const columns = children.map((text, index) => {
		return (
			<Typography
				noWrap
				className={classNames({
					[classes.headingText]: heading || headingNoRadius,
					[classes.subHeading]: subHeading,
					[classes.text]: !heading,
					[classes.totalText]: total || totalNoRadius
				})}
				key={index}
				style={columnStyles[index]}
			>
				{text}
			</Typography>
		);
	});

	return (
		<div
			className={classNames({
				[classes.root]: true,
				[classes.gray]: gray,
				[classes.total]: total,
				[classes.totalNoRadius]: totalNoRadius,
				[classes.heading]: heading,
				[classes.headingNoRadius]: headingNoRadius,
				[classes.subHeading]: subHeading
			})}
			{...rest}
		>
			{columns}
		</div>
	);
};

EventSettlementRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	gray: PropTypes.bool,
	total: PropTypes.bool,
	totalNoRadius: PropTypes.bool,
	heading: PropTypes.bool,
	headingNoRadius: PropTypes.bool,
	subHeading: PropTypes.bool
};

export default withStyles(styles)(EventSettlementRow);
