import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import nl2br from "../../../helpers/nl2br";
import { textColorPrimary } from "../../../config/theme";
import ArtistSummary from "../../elements/event/ArtistSummary";

const styles = theme => ({
	root: {
		paddingLeft: theme.spacing.unit * 10,
		paddingRight: theme.spacing.unit * 5,
		paddingTop: theme.spacing.unit * 5,
		paddingBottom: theme.spacing.unit * 10,

		[theme.breakpoints.down("md")]: {
			paddingLeft: theme.spacing.unit * 5,
			paddingRight: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 2,
			paddingBottom: theme.spacing.unit * 5
		}
	},
	eventDetailText: {
		color: textColorPrimary
	},
	artistsContainer: {
		paddingTop: theme.spacing.unit * 2
	}
});

const EventDescriptionBody = props => {
	const { classes, children, artists } = props;

	return (
		<div className={classes.root}>
			{children ? (
				<Typography className={classes.eventDetailText}>
					{nl2br(children)}
				</Typography>
			) : null}

			{artists && artists.length !== 0 ? (
				<Grid className={classes.artistsContainer} spacing={32} container direction="row" justify="flex-start" alignItems="flex-start">
					{artists.map(({ artist, importance }, index) => (
						<Grid
							item
							xs={12}
							sm={12}
							md={12}
							lg={6}
							xl={6}
							key={index}
						>
							<ArtistSummary headliner={importance === 0} {...artist}/>
						</Grid>
					))}
				</Grid>
			) : null}
		</div>
	);
};

EventDescriptionBody.defaultProps = {

};

EventDescriptionBody.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string,
	artists: PropTypes.array
};

export default withStyles(styles)(EventDescriptionBody);
