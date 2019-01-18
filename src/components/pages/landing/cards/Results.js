import React from "react";
import { observer } from "mobx-react";
import { withStyles, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

import ResultsRegionFilter from "./ResultsRegionFilter";
import eventResults from "../../../../stores/eventResults";
import EventResultCard from "../../../elements/event/EventResultCard";
import Button from "../../../elements/Button";

const styles = theme => ({
	subHeading: {
		marginBottom: theme.spacing.unit,
		textAlign: "center"
	},
	noResultsContainer: {
		paddingTop: theme.spacing.unit * 2,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: theme.spacing.unit * 10
	},
	noResultsImage: {
		width: 200,
		height: "auto",
		marginBottom: theme.spacing.unit * 2
	},
	noResultText: {
		marginBottom: theme.spacing.unit * 2
	}
});

const NoResults = ({ classes, onClear }) => (
	<div className={classes.noResultsContainer}>
		<img
			className={classes.noResultsImage}
			alt="No results found"
			src="/icons/events-gray.svg"
		/>
		<Typography className={classes.noResultText}>No results found.</Typography>
		<Button variant="callToAction" onClick={onClear}>
			Available events
		</Button>
	</div>
);

const EventsList = ({ events }) => {
	return (
		<Grid container spacing={24}>
			{events.map(({ venue, ...event }) => {
				if (!event) {
					console.error("Not found: ");
					return null;
				}
				event.door_time = event.door_time || event.event_start;
				const { timezone } = venue;
				return (
					<Grid item xs={12} sm={6} lg={4} key={event.id}>
						<EventResultCard venueTimezone={timezone} {...event}/>
					</Grid>
				);
			})}
		</Grid>
	);
};

const Results = observer(props => {
	const { classes } = props;
	const events = eventResults.filteredEvents;

	let hasResults = null;
	if (events === null) {
		hasResults = null;
	} else if (events instanceof Array) {
		if (events.length > 0) {
			hasResults = true;
		} else {
			hasResults = false;
		}
	}

	return (
		<div>
			<ResultsRegionFilter/>

			{hasResults === true ? <EventsList events={events}/> : null}

			{hasResults === false ? (
				<NoResults
					classes={classes}
					onClear={() => eventResults.clearFilter()}
				/>
			) : null}

			{hasResults === null ? (
				<Typography className={classes.subHeading}>Searching...</Typography>
			) : null}
		</div>
	);
});

export default withStyles(styles)(Results);
