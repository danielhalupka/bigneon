import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import {
	textColorPrimary,
	textColorSecondary,
	primaryHex,
	secondaryHex
} from "../../styles/theme";

const styles = theme => {
	return {
		root: {
			background: "transparent",
			boxShadow: theme.shadows[1]
		},
		icon: {
			//height: 20
		}
	};
};

const SocialButton = props => {
	const { classes, onClick, icon, style, size } = props;

	let src = "";
	switch (icon) {
		case "facebook":
			src = "/images/social/facebook-icon-gray.svg";
			break;
		case "twitter":
			src = "/images/social/twitter-icon-gray.svg";
			break;
		default:
			break;
	}

	const buttonStyle = { ...style, height: size, width: size };

	return (
		<Button
			classes={{
				root: classes.root
			}}
			onClick={onClick}
			variant="fab"
			style={buttonStyle}
		>
			<img style={{ height: size * 0.4 }} className={classes.icon} src={src} />
		</Button>
	);
};

SocialButton.defaultProps = {
	size: 60
};

SocialButton.propTypes = {
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired,
	icon: PropTypes.oneOf(["facebook", "twitter"]).isRequired,
	style: PropTypes.object,
	size: PropTypes.number
};

export default withStyles(styles)(SocialButton);
