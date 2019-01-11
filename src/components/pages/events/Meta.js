import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

//Reference: https://github.com/nfl/react-helmet

const Meta = ({ type, id, name, additional_info, promo_image_url, ...event }) => {
	let site = process.env.REACT_APP_WEB_URL;
	if (site.substring(site.length-1) == "/") {
		site = site.substring(0, site.length-1);
	}

	const url = `${site}/events/${id}`;
	let title;

	//If they're at a later stage of the event checkout, adjust title accordingly
	switch (type) {
		case "selection":
			title = `Buy tickets - ${name}`;
			break;
		case "checkout":
			title = `Checkout - ${name}`;
			break;
		case "success":
			title = `Success - ${name}`;
			break;
		default:
			title = name;
	}

	return (
		<Helmet>
			<title>{title}</title>

			<meta property="og:title" content={title} /><meta property="og:type" content="website" />
			<meta property="og:url" content={url} />
			<meta property="og:image" content="https://www.bigneon.com/site/images/bigneon-screen-app.png" />
			{additional_info ? <meta property="og:description" content={additional_info} /> : null}
			{additional_info ? <meta name="description" content={additional_info} /> : null}
			{promo_image_url ? <link rel="image_src" href={promo_image_url} /> : null}
		</Helmet>
	);
};

Meta.propTypes = {
	type: PropTypes.oneOf(["selection", "checkout", "success"]),
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	additional_info: PropTypes.string,
	promo_image_url: PropTypes.string
};

export default (Meta);
