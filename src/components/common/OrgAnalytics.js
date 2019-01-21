import React from "react";
import PropTypes from "prop-types";

import analytics from "../../helpers/analytics";

class OrgAnalytics extends React.Component {
	// true if ANY of the tracking keys have been initialized, otherwise false (including if deinitialized)
	initialized: false;

	componentWillReceiveProps(nextProps) {
		this.initializeAnalytics(nextProps.trackingKeys);
	}

	componentWillUnmount() {
		const { trackingKeys } = this.props;
		if (trackingKeys) {
			this.teardownAnalytics(trackingKeys);
		}
	}

	initializeAnalytics(keys) {
		if (!this.initialized) {
			if (keys.google_ga_key) {
				analytics.addTrackingKey("ga", keys.google_ga_key);
				this.initialized = true;
			}

			if (keys.facebook_pixel_key) {
				analytics.addTrackingKey("facebook", keys.facebook_pixel_key);
				this.initialized = true;
			}
			analytics.page();
		}
	}

	teardownAnalytics(keys) {
		if (this.initialized) {
			if (keys.google_ga_key) {
				analytics.removeTrackingKey("ga", keys.google_ga_key);
			}

			if (keys.facebook_pixel_key) {
				analytics.removeTrackingKey("facebook", keys.facebook_pixel_key);
			}
			this.initialized = false;
		}
	}

	render() {
		return <span/>;
	}
}

OrgAnalytics.propTypes = {
	trackingKeys: PropTypes.object.isRequired
};

export default OrgAnalytics;
