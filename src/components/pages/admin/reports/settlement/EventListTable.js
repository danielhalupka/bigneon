import React from "react";
import PropTypes from "prop-types";
import TotalsRow from "./TotalsRow";
import { dollars } from "../../../../../helpers/money";
import { Typography, withStyles } from "@material-ui/core";
import { fontFamilyDemiBold, secondaryHex } from "../../../../styles/theme";

const styles = theme => ({
	root: {},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.3,
		marginBottom: 10
	}
});

const EventListTable = props => {
	const {
		classes,
		eventDetails
	} = props;

	const columnStyles = [
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 1, textAlign: "left" },
		{ flex: 3, textAlign: "left" }
	];

	return (
		<div>
			<Typography className={classes.heading}>
				Grand totals
			</Typography>

			<TotalsRow
				columnStyles={columnStyles}
				heading
			>
				{[ "Event start Date/Time", "Event End Date/Time", "Venue", "Event Name" ]}
			</TotalsRow>

			{Object.keys(eventDetails).map((event_id, index) => {
				const { displayEndDate, displayStartDate, eventName, venueName } = eventDetails[event_id];
				const even = index % 2 === 0;

				return (
					<TotalsRow
						key={event_id}
						gray={even}
						darkGray={!even}
						columnStyles={columnStyles}
					>
						{[ displayStartDate, displayEndDate, venueName, eventName ]}
					</TotalsRow>
				);
			})}

		</div>
	);
};

EventListTable.propTypes = {
	classes: PropTypes.object.isRequired,
	eventDetails: PropTypes.object
};

export default withStyles(styles)(EventListTable);
