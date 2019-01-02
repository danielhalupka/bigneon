import React from "react";
import PropTypes from "prop-types";

//Creates a string like: "With Steve Marly, Bob Sinclair"
const SupportingArtistsLabel = ({ eventName, artists }) => {
	if (!artists) {
		return null;
	}

	return artists.map(({ artist }, index) => {
		if (index === 0) {
			if(eventName !== artist.name) {
				return <span key={index}>with {artist.name}{index + 1 < artists.length ? ", " : ""}</span>;
			} else if(index + 1 < artists.length) {
				return <span key={index}>with </span>;
			} else {
				return null;
			}
		}

		return (
			<span key={index}>
				{artist.name}
				{index + 1 < artists.length ? ", " : ""}
			</span>
		);
	});
};

SupportingArtistsLabel.propTypes = {
	artists: PropTypes.array
};

export default SupportingArtistsLabel;
