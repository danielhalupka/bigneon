import { Card, CardContent } from "@material-ui/core";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import React from "react";

const VenueEventApi = props => {
	const {
		venueId,
		classes
	} = props;

	return (
		<Card className={classes.paper}>
			<CardContent>
				<h4>Using bn-api-node:</h4>
				<pre className={classes.pre}>
					{
						`import Bigneon from "bn-api-node/dist/bundle.client";
let server = new Bigneon.Server({
	prefix: "https://www.bigneon.com/api"
});
server
	.venues
	.events
	.index({venue_id: "--venue_id--"}, null, true)
	.then(eventsIndex => {console.log(eventsIndex);});
`.replace("--venue_id--", venueId)
					}
				</pre>

				<h4>Raw javascript:</h4>
				<pre className={classes.pre}>
					{
						`fetch("https://www.bigneon.com/api/venues/--venue_id--/events")
	.then(raw => {
	return raw.json();
}).then(eventIndex => {
	console.log(eventIndex);
	console.log(eventIndex.data);
});`.replace("--venue_id--", venueId)
					}
				</pre>

				<h4>Direct query:</h4>
				<pre className={classes.pre}>
					{
						`curl -X GET -H "content-type: application/json" "https://www.bigneon.com/api/venues/--venue_id--/events"`.replace("--venue_id--", venueId)
					}
				</pre>
			</CardContent>
		</Card>
	);
};

VenueEventApi.propTypes = {
	classes: PropTypes.object.isRequired,
	venueId: PropTypes.string.isRequired
};

export default VenueEventApi;