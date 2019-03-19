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
			backgroundColor: "#E1E6EE"
		},
		darkGray: {
			backgroundColor: "#AFC6D4"
		},
		heading: {
			backgroundColor: "#000000",
			borderTopLeftRadius: 8,
			borderTopRightRadius: 8
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
		totalText: {
			color: "#FFFFFF",
			borderRadius: 4,
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold
		},
		text: {
			fontSize: theme.typography.fontSize * 0.9,
			fontFamily: fontFamilyDemiBold,
			textTransform: "capitalize"
		}
	};
};

const TotalsRow = props => {
	const { heading, gray, darkGray, children, onClick, classes, total, ...rest } = props;

	const columnStyles = [
		{ flex: 4, textAlign: "left" },
		{ flex: 2, textAlign: "right" }
	];

	const columns = children.map((child, index) => {
		if (typeof child === "string") {
			return (
				<Typography
					noWrap
					className={classNames({
						[classes.headingText]: heading,
						[classes.text]: !heading,
						[classes.totalText]: total
					})}
					key={index}
					style={columnStyles[index]}
				>
					{child}
				</Typography>
			);
		}

		return (
			<span
				key={index}
				style={columnStyles[index]}
			>
				{child}
			</span>
		);

	});

	return (
		<div
			className={classNames({
				[classes.root]: true,
				[classes.gray]: gray,
				[classes.total]: total,
				[classes.heading]: heading
			})}
			onClick={onClick}
			{...rest}
		>
			{columns}
		</div>
	);
};

TotalsRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	gray: PropTypes.bool,
	darkGray: PropTypes.bool,
	total: PropTypes.bool,
	heading: PropTypes.bool
};

export default withStyles(styles)(TotalsRow);
