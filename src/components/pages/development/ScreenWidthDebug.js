/**
 * Show the current screen width breakpoint
 */
import React from "react";
import { withStyles, withTheme } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Hidden from "@material-ui/core/Hidden";

const styles = theme => {
	return {
		text: {
			fontSize: 40,
			color: "red"
		},
		textSmall: {
			fontSize: 20,
			color: "red"
		}
	};
};

const ScreenWidthDebug = ({ classes, theme }) => {
	const sizes = ["xs", "sm", "md", "lg", "xl"];

	return (
		<div>
			{sizes.map(size => {
				const excludingSizes = [...sizes];
				excludingSizes.splice(sizes.indexOf(size), 1);

				return (
					<Hidden key={size} only={excludingSizes}>
						<Typography className={classes.text}>{size}</Typography>
						<Typography className={classes.textSmall}>{theme.breakpoints.only(size)}</Typography>
					</Hidden>
				);
			})}
		</div>
	);
};

export default withTheme()(withStyles(styles)(ScreenWidthDebug));
