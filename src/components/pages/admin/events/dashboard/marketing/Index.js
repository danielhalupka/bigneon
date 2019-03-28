import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Bigneon from "../../../../../../helpers/bigneon";

import user from "../../../../../../stores/user";
import Container from "../Container";
import Loader from "../../../../../elements/loaders/Loader";
import FacebookEvents from "./FacebookEvents";

const styles = theme => ({
	root: {}
});

@observer
class Marketing extends Component {
	constructor(props) {
		super(props);

		this.state = { eventName: null };
	}

	componentDidMount() {
		const eventId = this.props.match.params.id;

		Bigneon()
			.events.read({ id: eventId })
			.then(response => {
				const { name } = response.data;
				this.setState({ eventName: name });
			})
			.catch(error => {
				console.error(error);
			});
	}

	render() {
		const eventId = this.props.match.params.id;
		const type = this.props.match.params.type;
		const organizationId = user.currentOrganizationId;

		if (!organizationId) {
			return <Loader/>;
		}

		const { eventName } = this.state;

		let content;

		switch (type) {
			case "fb-events":
				content = (
					<FacebookEvents eventId={eventId}>FB here</FacebookEvents>
				);
				break;
			default:
				content = <Typography>Marketing unavailable.</Typography>;
				break;
		}

		return (
			<Container eventId={eventId} subheading={"marketing"}>
				{content}
			</Container>
		);
	}
}

Marketing.propTypes = {
	classes: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired
};

export default withStyles(styles)(Marketing);
