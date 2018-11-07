import React from "react";
import PropTypes from "prop-types";
import { withStyles, Card, Typography } from "@material-ui/core";
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
			backgroundColor: theme.palette.secondary.main
		},
		text: {},
		headingText: {
			fontSize: theme.typography.caption.fontSize
		},
		icon: { marginRight: theme.spacing.unit, width: 14, height: 14, cursor: "pointer" }
	};
};

const CompRow = props => {
	const { heading, gray, active, children, classes, actions, ...rest } = props;

	const columnStyles = [
		{ flex: 3, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 3, textAlign: "center" },
		{ flex: 2, textAlign: "center" },
		{ flex: 2, textAlign: "center" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" }
	];

	const columns = children.map((text, index) => {
		return (
			<Typography
				className={heading ? classes.headingText : classes.text}
				key={index}
				style={columnStyles[index]}
			>
				{text}
			</Typography>
		);
	});

	let actionButtons = <span>&nbsp;</span>;
	if (actions) {
		actionButtons = (
			<span>
				{actions.map(({ id, name, iconUrl, onClick }) => (
					<span key={name} onClick={() => {onClick && onClick(id, name)}}>
						<img alt={name} src={iconUrl} className={classes.icon} />
					</span>
				))}
			</span>
		);
	}

	return (
		<div
			className={classNames(
				classes.root,
				gray ? classes.gray : "",
				active ? classes.active : ""
			)}
			{...rest}
		>
			{columns}
			{actionButtons}
		</div>
	);
};

CompRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	gray: PropTypes.bool,
	active: PropTypes.bool,
	heading: PropTypes.bool,
	actions: PropTypes.array
};

export default withStyles(styles)(CompRow);
