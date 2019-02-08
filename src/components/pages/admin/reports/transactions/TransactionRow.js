import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";

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
		active: {
			backgroundColor: theme.palette.secondary.main,
			color: "#FFFFFF"
		},
		text: {
			fontSize: theme.typography.fontSize * 0.9
		},
		activeText: {
			color: "#FFFFFF"
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
		pointer: {
			cursor: "pointer"
		}
	};
};

const TransactionRow = props => {
	const { heading, gray, active, children, onClick, classes, ...rest } = props;

	const columnStyles = [
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" }
	];

	//If they're adding the event name, make the second column side
	if (children.length === 10) {
		columnStyles.splice(0, 0, { flex: 2, textAlign: "left" });
	}

	const columns = children.map((text, index) => {
		return (
			<Typography
				noWrap
				className={classNames({
					[classes.text]: true,
					[classes.headingText]: heading,
					[classes.activeText]: active
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
				[classes.heading]: heading,
				[classes.gray]: gray,
				[classes.active]: active,
				[classes.pointer]: !!onClick
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
	active: PropTypes.bool,
	heading: PropTypes.bool,
	onClick: PropTypes.func,
	onMouseEnter: PropTypes.func,
	onMouseLeave: PropTypes.func
};

export default withStyles(styles)(TransactionRow);
