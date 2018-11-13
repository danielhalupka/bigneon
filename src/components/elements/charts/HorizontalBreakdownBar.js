import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import { fontFamilyDemiBold } from "../../styles/theme";
import Tooltip from "../Tooltip";

const height = 14;

const styles = {
	root: {
		flex: 1
	},
	title: {
		fontFamily: fontFamilyDemiBold
	},
	bar: {
		flex: 1,
		display: "flex"
	},
	section: {
		height
	},
	leftSection: {
		height,
		borderRadius: "10px 0px 0px 10px"
	},
	rightSection: {
		height,
		borderRadius: "0px 10px 10px 0px"
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
					let sectionClassName = "section";
					if (index === 0) {
						sectionClassName = "leftSection";
					} else if (index === values.length - 1) {
						sectionClassName = "rightSection";
					}

					return (
						<Tooltip key={index} title={`${value}`} text={label}>
							<div
								className={classes[sectionClassName]}
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
