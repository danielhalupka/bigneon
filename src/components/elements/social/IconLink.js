//TODO get this to display correctly
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import {
	textColorPrimary,
	textColorSecondary,
	primaryHex,
	secondaryHex
} from "../../styles/theme";

const styles = theme => {
	return {
		container: {
			cursor: "pointer",
			width: "13.5px",
			height: "13.5px",
			borderStyle: "solid",
			borderWidth: "0.5px",
			borderImageSource: "linear-gradient(229deg, #e53d96, #5491cc)",
			borderImageSlice: "1"
		},
		icon: {}
	};
};

const SocialButton = props => {
	const { classes, onClick, href, icon, style, size } = props;

	let src = "";
	switch (icon) {
		case "facebook":
			src = "/images/social/facebook-icon-gray.svg";
			break;
		case "twitter":
			src = "/images/social/twitter-icon-gray.svg";
			break;
		case "instagram":
			src = "/images/social/instagram-icon-gray.svg";
			break;
		case "soundcloud":
			src = "/images/social/soundcloud-icon-gray.svg";
			break;
		case "snapchat":
			src = "/images/social/snapchat-icon-gray.svg";
			break;
		case "bandcamp":
			src = "/images/social/facebook-icon-gray.svg";
			break;
		case "website":
			src = "/images/social/facebook-icon-gray.svg";
			break;
		default:
			break;
	}

	//TODO href={href}

	return (
		<div
			className={classes.container}
			onClick={onClick}
			target={href ? "_blank" : null}
		>
			{/* <img
				style={{ height: size * 0.4, width: size * 0.4 }}
				className={classes.icon}
				src={src}
			/> */}
		</div>
	);
};

SocialButton.defaultProps = {
	size: 25
};

SocialButton.propTypes = {
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func,
	href: PropTypes.string,
	icon: PropTypes.oneOf([
		"facebook",
		"twitter",
		"instagram",
		"soundcloud",
		"snapchat",
		"website",
		"bandcamp"
	]).isRequired,
	size: PropTypes.number
};

export default withStyles(styles)(SocialButton);
