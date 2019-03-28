import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import { observer } from "mobx-react";
import QRCode from "qrcode.react";

import notifications from "../../stores/notifications";
import selectedEvent from "../../stores/selectedEvent";
import { primaryHex } from "../styles/theme";
import Loader from "../elements/loaders/Loader";
import { displayAgeLimit } from "../../helpers/ageLimit";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	descriptionDiv: {
		marginTop: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	}
});

@observer
class EventQR extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;
			this.setState({ eventId: id });

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	render() {
		const { classes } = this.props;
		const { eventId } = this.state;

		const { event, venue, artists, organization, id } = selectedEvent;

		if (event === null) {
			return <Loader/>;
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		const href = window.location.href;
		const host = href.substring(0, href.indexOf("/widget")); //TODO better especially if widget gets hosted on different doimain
		const qrText = `${host}/events/${eventId}`;

		const {
			name,
			displayEventStartDate,
			additional_info,
			age_limit,
			promo_image_url,
			displayDoorTime,
			displayShowTime
		} = event;
		const ageLimit = displayAgeLimit(age_limit);

		return (
			<div className={classes.card}>
				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Typography variant="subheading">
							{displayEventStartDate}
						</Typography>
						<br/>
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<Typography variant="caption">
							{organization.name} presents
						</Typography>

						<Typography variant="display3" component="h3">
							{name}
						</Typography>

						<Typography variant="subheading">{venue.name}</Typography>
					</Grid>

					<Grid item xs={12} sm={6} lg={6}>
						<QRCode size={400} fgColor={primaryHex} value={qrText}/>
					</Grid>
					<Grid item xs={12} sm={6} lg={6}>
						<div style={{ marginBottom: 30 }}/>

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Date and time
						</Typography>

						<Typography variant="body1">{displayEventStartDate}</Typography>
						<Typography variant="body1">
							Doors: {displayDoorTime} / Show: {displayShowTime}
						</Typography>
						<Typography variant="body1">
							{ageLimit}
						</Typography>

						<div style={{ marginBottom: 30 }}/>

						<Typography style={{ marginBottom: 10 }} variant="subheading">
							Location
						</Typography>

						<Typography variant="body1">{venue.name}</Typography>
						<Typography variant="body1">{venue.address}</Typography>
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<div className={classes.descriptionDiv}>
							<Typography variant="headline">Description</Typography>
							<Typography variant="body1">{additional_info}</Typography>
						</div>
					</Grid>
				</Grid>
			</div>
		);
	}
}

EventQR.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EventQR);
