import React from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

//Reference: https://github.com/nfl/react-helmet

const ExportMetaTags = ({ eventName, reportLabel }) => {
	return (
		<Helmet title={`${reportLabel}${eventName ? ` - ${eventName}` : ""}`}/>
	);
};

ExportMetaTags.propTypes = {
	eventName: PropTypes.string,
	reportLabel: PropTypes.string.isRequired
};

export default (ExportMetaTags);
