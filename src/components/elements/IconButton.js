//Base component https://material-ui.com/api/button/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import classNames from "classnames";

const styles = theme => {
	return {
		root: {
			border: 0
		}
	};
};

const CustomIconButton = props => {
	const { children, classes, iconUrl, ...rest } = props;

	return (
		<IconButton
			classes={{
				root: classNames(classes.root)
			}}
			{...rest}
		>
			<img alt={children || ""} className={classes.leftIcon} src={iconUrl} />
		</IconButton>
	);
};
CustomIconButton.defaultProps = {};

CustomIconButton.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([PropTypes.string]).isRequired,
	iconUrl: PropTypes.string
};

export default withStyles(styles)(CustomIconButton);
