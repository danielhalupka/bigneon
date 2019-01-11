import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

//Reference: https://github.com/nfl/react-helmet

const Meta = ({ type }) => {
	let site = process.env.REACT_APP_WEB_URL;
	if (site.substring(site.length-1) == "/") {
		site = site.substring(0, site.length-1);
	}

	const url = `${site}/${type}`;
	let appName = process.env.REACT_APP_NAME;
	let title = "";
	let description = "";

	switch (type) {
		case "login":
			title = `Login - ${appName}`;
			description = `Login to ${appName}`;
			break;
		case "sign-up":
			title = `Sign up - ${appName}`;
			description = `Sign up to ${appName}`;
			break;
	}

	return (
		<Helmet>
			<title>{title}</title>

			<meta property="og:title" content={title} /><meta property="og:type" content="website" />
			<meta property="og:url" content={url} />
			<link rel="image_src" href="https://www.bigneon.com/site/images/home-logo.png" />
			<meta property="og:description" content={description} />
			<meta name="description" content={description} />
		</Helmet>
	);
};

Meta.propTypes = {
	type: PropTypes.oneOf(["login", "sign-up"])
};

export default (Meta);
