import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";
import { fontFamilyDemiBold } from "../../../../../styles/theme";

const styles = theme => {
	return {
		root: {
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2,

			paddingTop: theme.spacing.unit * 2,
			paddingBottom: theme.spacing.unit * 2,

			display: "flex",
			borderRadius: 4
		},
		default: {},
		gray: {
			backgroundColor: "#f5f7fa"
		},
		text: {},
		textTicketType: {
			fontFamily: fontFamilyDemiBold
		},
		headingText: {
			fontSize: theme.typography.caption.fontSize
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
		children,
		onClick,
		classes,
		ticketTypeRow,
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
		let className = heading ? classes.headingText : classes.text;

		if (ticketTypeRow) {
			className = classes.textTicketType;
		}

		return (
			<Typography className={className} key={index} style={columnStyles[index]}>
				{text}
			</Typography>
		);
	});

	return (
		<div
			className={classNames(
				classes.root,
				gray ? classes.gray : "",
				onClick ? classes.pointer : ""
			)}
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
	heading: PropTypes.bool,
	onClick: PropTypes.func,
	ticketTypeRow: PropTypes.bool
};

export default withStyles(styles)(TransactionRow);
