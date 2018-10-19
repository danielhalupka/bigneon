import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles, Grid, Typography } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";

import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import FormSubHeading from "../../../../common/FormSubHeading";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class PublishCard extends Component {
	constructor(props) {
		super(props);

		const { eventDetails } = props;

		const { status } = eventDetails;

		this.state = {
			errors: {},
			isPublished: status === "Published",
			isSubmitting: false
		};
	}

	changeEventStatus(isPublished, onSuccess) {
		//TODO implement an un publish call when ready in API
		const { eventId } = this.props;
		Bigneon()
			.events.publish({ id: eventId })
			.then(response => {
				const { id } = response.data;
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.show({
					message: "Event status change failed.",
					variant: "error"
				});
			});
	}

	onPublish() {
		this.setState({ isSubmitting: true });
		const { onNext } = this.props;
		this.changeEventStatus(true, id => {
			notifications.show({
				message: "Event published.",
				variant: "success"
			});

			onNext();
		});
	}

	render() {
		const { isSubmitting, isPublished } = this.state;

		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<CardContent>
					<FormSubHeading>Event status</FormSubHeading>

					<Grid container spacing={24}>
						<Grid item xs={12} sm={12} lg={12}>
							<Typography variant="subheading">
								Event is currently {isPublished ? "published" : "unpublished"}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
				<CardActions>
					<Button
						disabled={isSubmitting || isPublished}
						style={{ marginRight: 10 }}
						customClassName="callToAction"
						onClick={this.onPublish.bind(this)}
					>
						{isSubmitting ? "Publishing..." : "Publish event"}
					</Button>
				</CardActions>
			</Card>
		);
	}
}

PublishCard.propTypes = {
	eventId: PropTypes.string,
	organizationId: PropTypes.string.isRequired,
	onNext: PropTypes.func.isRequired,
	eventDetails: PropTypes.object,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(PublishCard);
