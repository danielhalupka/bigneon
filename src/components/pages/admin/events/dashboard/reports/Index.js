import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import Bigneon from "../../../../../../helpers/bigneon";

import user from "../../../../../../stores/user";
import Container from "../Container";
import TransactionsList from "../../../reports/transactions/Transactions";
import EventSummary from "./EventSummary";

const styles = theme => ({
	root: {}
});

@observer
class Report extends Component {
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
			return <Typography>Loading...</Typography>;
		}

		const { eventName } = this.state;

		let content;

		switch (type) {
			case "transactions":
				content = (
					<TransactionsList
						eventName={eventName}
						organizationId={organizationId}
						eventId={eventId}
					/>
				);
				break;

			case "summary":
				content = (
					<EventSummary
						eventName={eventName}
						organizationId={organizationId}
						eventId={eventId}
					/>
				);
				break;

			default:
				content = <Typography>Report unavailable.</Typography>;
				break;
		}

		return (
			<Container eventId={eventId} subheading={"reports"}>
				{content}
			</Container>
		);
	}
}

Report.propTypes = {
	classes: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired
};

export default withStyles(styles)(Report);
