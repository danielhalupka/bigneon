import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

//Reference: https://github.com/nfl/react-helmet

const Meta = ({ type, id, name, additional_info, promo_image_url, ...event }) => {
	let site = process.env.REACT_APP_WEB_URL;
	if (site.substring(site.length - 1) == "/") {
		site = site.substring(0, site.length - 1);
	}

	const url = `${site}/events/${id}`;
	let title;
	let description = `${name} - Find tickets to live events and concerts on Big Neon.`; 
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
			title = `${name} Tickets on Big Neon` ;
	}

	return (
		<Helmet
			title={title}
			meta={[
				{ property: "og:title", content: title },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: url },
				{ property: "og:description", content: description },
				{ property: "og:image", content: promo_image_url },
				{ name: "twitter:site", content: "bigneon.com" },
				{ name: "twitter:creator", content: "bigneon" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:image", content: promo_image_url },
				{ name: "description", content: description }
			]}
			link={[
				{ rel: "canonical", href: url },
				{ rel: "image_src", href: promo_image_url }
			]}
		/>
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
