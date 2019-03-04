import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";

import notifications from "../../../stores/notifications";
import { fontFamilyDemiBold } from "../../styles/theme";
import Bigneon from "../../../helpers/bigneon";
import VenueHeaderImage from "../../elements/venue/VenueHeaderImage";
import EventResultCard from "../../elements/event/EventResultCard";
import StyledLink from "../../elements/StyledLink";
import Loader from "../../elements/loaders/Loader";

const styles = theme => ({
	root: {},
	eventName: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 2
	},
	content: {
		paddingTop: theme.spacing.unit * 4
	},
	filterContainer: {
		display: "flex",
		justifyContent: "flex-end"
	},
	filterLink: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9,
		marginLeft: theme.spacing.unit * 3
	}
});

class ViewVenue extends Component {
	constructor(props) {
		super(props);

		this.state = {
			venue: null,
			events: null
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			Bigneon()
				.venues.read({ id })
				.then(response => {
					this.setState({ venue: response.data });

					Bigneon()
						.venues.events.index({ venue_id: id })
						.then(response => {
							const { data, paging } = response.data; //TODO paging
							const events = [];
							data.forEach(event => {
								if (event.status === "Published") {
									events.push(event);
								}
							});
							this.setState({ events });
						})
						.catch(error => {
							console.error(error);
							notifications.showFromErrorResponse({
								error,
								defaultMessage: "Failed to load venue details."
							});
						});
				})
				.catch(error => {
					console.error(error);
					notifications.showFromErrorResponse({
						error,
						defaultMessage: "Failed to load venue details."
					});
				});
		} else {
			//TODO return 404
		}
	}

	renderEvents() {
		const { events, venue } = this.state;

		if (events === null) {
			return <Loader>Finding events...</Loader>;
		}
		const { timezone } = venue;

		return events.map(event => {
			//TODO remove this. It's a temp fix until bn-api changes this field name.
			const max_ticket_price =
				event.max_ticket_price || event.max_ticket_price_cache;
			const min_ticket_price =
				event.min_ticket_price || event.min_ticket_price_cache;

			return (
				<Grid key={event.id} item xs={12} sm={12} md={6} lg={4}>
					<EventResultCard
						{...event}
						venueTimezone={timezone}
						max_ticket_price={max_ticket_price}
						min_ticket_price={min_ticket_price}
					/>
				</Grid>
			);
		});
	}

	render() {
		const { classes } = this.props;
		const { venue } = this.state;

		if (venue === null) {
			return <Loader/>;
		}

		if (venue === false) {
			return <Typography variant="subheading">Venue not found.</Typography>;
		}

		const { id, name } = venue;

		return (
			<div className={classes.root}>
				<VenueHeaderImage venue={venue}/>

				<Grid
					container
					spacing={32}
					direction="row"
					justify="center"
					className={classes.content}
				>
					<Grid item xs={11} sm={10} md={6} lg={6}>
						<Typography className={classes.eventName}>
							Events at {name}
						</Typography>
					</Grid>

					<Grid
						item
						xs={11}
						sm={10}
						md={3}
						lg={3}
						className={classes.filterContainer}
					>
						<Typography className={classes.filterLink}>
							<StyledLink underlined to={`/venues/${id}`}>
								Show all
							</StyledLink>
						</Typography>

						<Typography className={classes.filterLink}>
							<StyledLink to={`/venues/${id}`}>Just announced</StyledLink>
						</Typography>
					</Grid>

					<Grid item xs={11} sm={10} md={9} lg={9}>
						<Grid container spacing={32}>
							{this.renderEvents()}
						</Grid>
					</Grid>
				</Grid>
			</div>
		);
	}
}

ViewVenue.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ViewVenue);
