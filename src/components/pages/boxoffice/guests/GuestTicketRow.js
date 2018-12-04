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
		display: "flex"
	},
	headingContainer: {
		backgroundColor: "black",
		borderRadius: "8px 8px 0 0",
		marginBottom: 0
	},
	heading: {
		color: "#FFFFFF",
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold
	},
	itemText: {}
});

const GuestTicketRow = props => {
	const { heading, children, classes } = props;

	const columnStyles = [
		{ flex: 1, textAlign: "left" },
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
			<span key={index} style={columnStyles[index]}>
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
