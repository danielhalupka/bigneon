import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";

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
		active: {
			backgroundColor: theme.palette.secondary.main,
			color: "#FFFFFF"
		},
		text: {},
		activeText: {
			color: "#FFFFFF"
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
	const { heading, gray, active, children, onClick, classes, ...rest } = props;

	const columnStyles = [
		{ flex: 1, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" }
	];

	const columns = children.map((text, index) => {
		const className = heading
			? classes.headingText
			: active
				? classes.activeText
				: classes.text;
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
				active ? classes.active : "",
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
	active: PropTypes.bool,
	heading: PropTypes.bool,
	onClick: PropTypes.func,
	onMouseEnter: PropTypes.func,
	onMouseLeave: PropTypes.func
};

export default withStyles(styles)(TransactionRow);
