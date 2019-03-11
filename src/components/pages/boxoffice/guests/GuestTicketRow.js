import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography } from "@material-ui/core";
import classNames from "classnames";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold } from "../../../styles/theme";

const styles = theme => ({
	root: {
		marginBottom: theme.spacing.unit / 2,
		padding: theme.spacing.unit,
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		display: "flex",

		[theme.breakpoints.down("sm")]: {
			// display: "inline-block",
			minWidth: 600
			//borderStyle: "solid"
		}
	},
	headingContainer: {
		backgroundColor: "black",
		borderRadius: "8px 8px 0 0",
		marginBottom: 0
	},
	heading: {
		color: "#FFFFFF",
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 0.8
		}
	},
	itemText: {
		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 0.8
		}
	}
});

const GuestTicketRow = props => {
	const { heading, children, classes } = props;

	const columnStyles = [
		{ flex: 2, textAlign: "left" },
		{ flex: 4, textAlign: "left" },
		{ flex: 8, textAlign: "left" },
		{ flex: 8, textAlign: "left" },
		{ flex: 3, textAlign: "right" },
		{ flex: 4, textAlign: "right" }
	];

	const columns = children.map((child, index) => {
		if (heading) {
			return (
				<Typography
					key={index}
					style={columnStyles[index]}
					className={classes.heading}
				>
					{child}
				</Typography>
			);
		}

		return (
			<span
				key={index}
				style={columnStyles[index]}
				className={classes.itemText}
			>
				{child}
			</span>
		);
	});

	return (
		<Card
			variant="block"
			classes={{
				root: classNames({
					[classes.root]: true,
					[classes.headingContainer]: heading
				})
			}}
		>
			{columns}
		</Card>
	);
};

GuestTicketRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	heading: PropTypes.bool
};

export default withStyles(styles)(GuestTicketRow);
