import React from "react";
import { observer } from "mobx-react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

import SearchResultEventCard from "./SearchResultEventCard";
import eventResults from "../../../../stores/eventResults";

const styles = theme => ({
	subHeading: {
		marginBottom: theme.spacing.unit
	}
});

const EventsList = ({ events }) => {
	return events.map(event => (
		<Grid item xs={12} sm={6} lg={4} key={event.id}>
			<SearchResultEventCard {...event} />
		</Grid>
	));
};

const Results = observer(props => {
	const { classes } = props;
	const { events } = eventResults;
	let label = "Searching for events...";
	if (events === null) {
		label = "Searching for events...";
	} else if (events instanceof Array) {
		if (events.length > 0) {
			label = "Showing events in San Francisco";
		} else {
			label = "No results found";
		}
	}

	return (
		<div>
			<Typography
				variant="subheading"
				gutterBottom
				className={classes.subHeading}
			>
				{label}
			</Typography>
			<Grid container spacing={24}>
				{events ? <EventsList events={events} /> : null}
			</Grid>
		</div>
	);
});

export default withStyles(styles)(Results);
