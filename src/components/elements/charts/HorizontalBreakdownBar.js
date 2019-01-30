import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import { fontFamilyDemiBold } from "../../styles/theme";
import Tooltip from "../Tooltip";

const styles = {
	root: {
		flex: 1
	},
	title: {
		fontFamily: fontFamilyDemiBold
	},
	bar: {
		flex: 1,
		display: "flex",
		borderRadius: 10,
		height: 14,
		overflow: "auto"
	},
	section: {
		height: "100%"
	}
};

const colors = ["#707ced", "#afc6d4", "#ff22b2"];

const HorizontalBreakdownBar = props => {
	const { title, classes, values } = props;

	return (
		<div className={classes.root}>
			<Typography className={classes.title}>{title}</Typography>
			<div className={classes.bar}>
				{values.map(({ label, value }, index) => {
					return (
						<Tooltip key={index} title={`${value}`} text={label}>
							<div
								className={classes.section}
								style={{
									flex: value,
									backgroundColor: colors[index]
								}}
							/>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
};

HorizontalBreakdownBar.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	values: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.number.isRequired
		}).isRequired
	)
};

export default withStyles(styles)(HorizontalBreakdownBar);
