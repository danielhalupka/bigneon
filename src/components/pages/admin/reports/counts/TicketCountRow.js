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
		subHeading: {
			backgroundColor: "#f5f7fa",
			fontWeight: "bold"
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
			borderRadius: 4
		},
		text: {
			fontSize: theme.typography.fontSize * 0.9
		}
	};
};

const TicketCountRow = props => {
	const { heading, subHeading, gray, children, classes, total, ...rest } = props;

	const columnStyles = [
		{ flex: 3, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" }
	];

	//If they're adding the event name, make the second column sider
	if (children.length === 8) {
		columnStyles.splice(1, 0, { flex: 3, textAlign: "left" });
	}

	const columns = children.map((text, index) => {
		return (
			<Typography
				noWrap
				className={classNames({
					[classes.headingText]: heading,
					[classes.subHeading]: subHeading,
					[classes.text]: !heading,
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
				[classes.total]: total,
				[classes.heading]: heading,
				[classes.subHeading]: subHeading
			})}
			{...rest}
		>
			{columns}
		</div>
	);
};

TicketCountRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	gray: PropTypes.bool,
	total: PropTypes.bool,
	heading: PropTypes.bool,
	subHeading: PropTypes.bool
};

export default withStyles(styles)(TicketCountRow);
