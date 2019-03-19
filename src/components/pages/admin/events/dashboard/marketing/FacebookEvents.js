import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";

import Bigneon from "../../../../../../helpers/bigneon";
import user from "../../../../../../stores/user";
import Loader from "../../../../../elements/loaders/Loader";

const styles = theme => ({
	root: {}
});

class FacebookEvents extends Component {
	constructor(props) {
		super(props);

		this.state = { eventName: null };
	}

	componentDidMount() {
		const { eventId } = this.props;

		//If you need event details, use the eventId prop
		// Bigneon()
		// 	.events.read({ id: eventId })
		// 	.then(response => {
		// 		this.setState({ event: response.data });
		// 	})
		// 	.catch(error => {
		// 		console.error(error);
		// 	});
	}

	render() {
		const { event } = this.state;

		return (
			<div>
				TODO
			</div>
		);
	}
}

FacebookEvents.propTypes = {
	classes: PropTypes.object.isRequired,
	eventId: PropTypes.string.isRequired
};

export default withStyles(styles)(FacebookEvents);
