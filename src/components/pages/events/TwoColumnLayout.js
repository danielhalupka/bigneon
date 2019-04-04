import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import classnames from "classnames";

const styles = theme => ({
	root: {},
	container: {
		maxWidth: 1109
	}
});

const TwoColumnLayout = props => {
	const { classes, rootClass, containerClass, containerStyle, col1, col2 } = props;

	return (
		<Grid
			container
			spacing={0}
			direction="row"
			justify="center"
			alignItems="center"
			className={classnames({ [classes.root]: true, [rootClass]: true })}
		>
			<Grid
				className={classnames({ [containerClass]: true, [classes.container]: true })}
				style={containerStyle}
				item
				xs={12}
				sm={8}
				lg={9}
				xl={6}
			>
				<Grid
					container
					spacing={0}
				>
					<Grid item xs={6} sm={7} md={7} lg={7} xl={7}>
						{col1}
					</Grid>
					<Grid item xs={6} sm={5} md={5} lg={5} xl={5}>
						{col2}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

TwoColumnLayout.defaultProps = {
	rootClass: "",
	outerClass: "",
	outerStyle: {}
};

TwoColumnLayout.propTypes = {
	classes: PropTypes.object.isRequired,
	rootClass: PropTypes.string,
	containerClass: PropTypes.string,
	containerStyle: PropTypes.object,
	col1: PropTypes.any,
	col2: PropTypes.any
};

export default withStyles(styles)(TwoColumnLayout);
