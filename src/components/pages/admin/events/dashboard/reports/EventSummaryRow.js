import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";
import { fontFamilyDemiBold, primaryHex } from "../../../../../styles/theme";

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
		text: {
			fontSize: theme.typography.fontSize * 0.9
		},
		textTicketType: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 0.95
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
			backgroundColor: primaryHex
		},
		radiusTotal: {
			borderBottomLeftRadius: 8,
			borderBottomRightRadius: 8
		},
		totalText: {
			color: "#FFFFFF"
		},
		pointer: {
			cursor: "pointer"
		}
	};
};

const TransactionRow = props => {
	const {
		heading,
		gray,
		total,
		children,
		onClick,
		classes,
		ticketTypeRow,
		noRadius,
		...rest
	} = props;

	const columnStyles = [
		{ flex: 2, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" }
	];

	const columns = children.map((text, index) => {
		return (
			<Typography
				className={classNames({
					[classes.text]: true,
					[classes.headingText]: heading,
					[classes.textTicketType]: ticketTypeRow,
					[classes.totalText]: total
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
				[classes.pointer]: !!onClick,
				[classes.total]: total,
				[classes.heading]: heading,
				[classes.radiusTotal]: total && !noRadius
			})}
			onClick={onClick}
			{...rest}
		>
			{columns}
		</div>
	);
};

TransactionRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	gray: PropTypes.bool,
	total: PropTypes.bool,
	heading: PropTypes.bool,
	onClick: PropTypes.func,
	ticketTypeRow: PropTypes.bool,
	noRadius: PropTypes.bool
};

export default withStyles(styles)(TransactionRow);
