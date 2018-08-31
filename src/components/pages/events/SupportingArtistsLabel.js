import React from "react";
import PropTypes from "prop-types";

//Creates a string like: "With Steve Marly, Bob Sinclair"
const SupportingArtistsLabel = ({ artists }) => {
	if (!artists || artists.length < 2) {
		return null;
	}

	return artists.map(({ name }, index) => {
		if (index === 0) {
			return <span key={index}>With </span>;
		}

		return (
			<span key={index}>
				{name}
				{index + 1 < artists.length ? ", " : ""}
			</span>
		);
	});
};

SupportingArtistsLabel.propTypes = {
	artists: PropTypes.array
};

export default SupportingArtistsLabel;
