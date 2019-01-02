import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { fontFamilyDemiBold, secondaryHex } from "../styles/theme";

const styles = theme => {
	return {
		mainContent: {
			display: "flex",
			marginBottom: theme.spacing.unit * 2,
			alignItems: "flex-end",
			height: 45
		},
		heading: {
			color: theme.typography.headline.color,
			textTransform: "capitalize",
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 2.5,
			lineHeight: 0.5
		},
		longHeading: {
			alignContent: "center",
			lineHeight: "75%",
			fontSize: theme.typography.fontSize * 1.57
		},
		subheading: {
			color: secondaryHex,
			textTransform: "uppercase",
			lineHeight: 0.5,
			fontSize: theme.typography.fontSize * 1.2
		},
		icon: {
			width: "auto",
			height: "100%",
			marginRight: theme.spacing.unit * 1.8
		}
	};
};

const PageHeading = props => {
	const { classes, iconUrl, children, subheading, style = {} } = props;

	//Calculate the total characters for the heading and adjust style for lengthy ones
	let totalChars = 0;
	if (typeof children === "string") {
		totalChars = children.length;
	} else if (Array.isArray(children)) {
		children.forEach(child => {
			if (typeof child === "string") {
				totalChars = totalChars + child.length;
			}
		});
	}

	const headingIsLong = totalChars > 21; //Adjust this if needed

	return (
		<div style={style}>
			<div className={classes.mainContent}>
				{iconUrl ? (
					<img alt={children} src={iconUrl} className={classes.icon} />
				) : null}
				<Typography
					className={classnames({
						[classes.heading]: true,
						[classes.longHeading]: headingIsLong
					})}
				>
					{children}
				</Typography>
			</div>

			{subheading ? (
				<Typography className={classes.subheading}>{subheading}</Typography>
			) : null}
		</div>
	);
};

PageHeading.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
	subheading: PropTypes.string,
	style: PropTypes.object
};

export default withStyles(styles)(PageHeading);
