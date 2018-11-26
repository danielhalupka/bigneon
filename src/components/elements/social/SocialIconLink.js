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
			cursor: "pointer"
			// width: "13.5px",
			// height: "13.5px",
			// borderStyle: "solid",
			// borderWidth: "0.5px",
			// borderImageSource: "linear-gradient(229deg, #e53d96, #5491cc)",
			// borderImageSlice: "1"
		},
		icon: {}
	};
};

const SocialIconLink = props => {
	const { classes, userName, onClick, href, icon, style, size, color } = props;

	let src = "";
	let socialLink = "";

	switch (icon) {
		case "facebook":
			src = `/images/social/facebook-circle-${color}.png`;
			socialLink = `https://facebook.com/${userName}`;
			break;
		case "twitter":
			src = `/images/social/twitter-circle-${color}.png`;
			socialLink = `https://twitter.com/${userName}`;
			break;
		case "instagram":
			src = `/images/social/instagram-circle-${color}.png`;
			socialLink = `https://instagram.com/${userName}`;
			break;
		case "soundcloud":
			src = `/images/social/soundcloud-circle-${color}.png`;
			socialLink = `https://soundcloud.com/${userName}`;
			break;
		case "snapchat":
			src = `/images/social/snapchat-circle-${color}.png`;
			socialLink = `https://www.snapchat.com/add/${userName}`;
			break;
		case "bandcamp":
			src = `/images/social/bandcamp-circle-${color}.png`;
			socialLink = `https://bandcamp.com/${userName}`;
			break;
		case "website":
			src = `/images/social/link-circle-${color}.png`;
			break;
		default:
			break;
	}

	let toLink = href;

	//If they pass a username, use the social link
	if (userName && socialLink) {
		toLink = socialLink;
	}

	return (
		<a
			className={classes.container}
			onClick={onClick}
			target={toLink ? "_blank" : null}
			href={toLink ? toLink : null}
			style={style}
		>
			<img
				style={{ height: size, width: size }}
				className={classes.icon}
				src={src}
			/>
		</a>
	);
};

SocialIconLink.defaultProps = {
	size: 25,
	style: {},
	color: "white"
};

SocialIconLink.propTypes = {
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
	userName: PropTypes.string,
	size: PropTypes.number,
	color: PropTypes.oneOf(["white", "black"])
};

export default withStyles(styles)(SocialIconLink);
