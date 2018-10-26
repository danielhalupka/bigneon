import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Link } from "react-router-dom";

import notifications from "../../../../../stores/notifications";
import Button from "../../../../elements/Button";
import Bigneon from "../../../../../helpers/bigneon";
import PageHeading from "../../../../elements/PageHeading";
import Divider from "../../../../common/Divider";
import HoldRow from "./HoldRow";

const styles = theme => ({
	paper: {}
});

class TicketHoldList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventName: "",
			holds: [
				{
					id: "123",
					name: "Artist comps",
					code: "133h3j3j",
					ticket_type: "General admission",
					total_held: 100,
					claimed: 8
				},
				{
					id: "456",
					name: "Venue comps",
					code: "393ndnj3j",
					ticket_type: "General admission",
					total_held: 200,
					claimed: 16
				},
				{
					id: "789",
					name: "Guptas",
					code: "knks2838",
					ticket_type: "VIP",
					total_held: 10,
					claimed: 3
				}
			]
		};
	}

	componentDidMount() {
		const { match } = this.props;

		if (match && match.params && match.params.id) {
			this.eventId = match.params.id;
			this.loadEventDetails();
			this.refreshHolds();
		} else {
			//TODO 404
		}
	}

	loadEventDetails() {
		Bigneon()
			.events.read({ id: this.eventId })
			.then(response => {
				const { name } = response.data;
				this.setState({
					eventName: name
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Loading event details failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	refreshHolds() {
		if (this.eventId) {
			console.log("TODO: pull holds fro, API");
		}
	}

	renderList() {
		const { holds, activeHoldId } = this.state;
		const { classes } = this.props;

		if (holds === null) {
			return <Typography variant="body1">Loading...</Typography>;
		}

		if (holds && holds.length > 0) {
			const ths = [
				"Name",
				"Code",
				"Ticket Type",
				"Claimed from hold",
				"Remaining",
				"Remaining",
				"Action"
			];

			return (
				<div>
					<HoldRow heading>{ths}</HoldRow>
					{holds.map((ticket, index) => {
						const { id, name, code, ticket_type, total_held, claimed } = ticket;

						const tds = [
							name,
							code,
							ticket_type,
							total_held,
							claimed,
							`${total_held - claimed}`
						];

						return (
							<HoldRow
								onMouseEnter={() => this.setState({ activeHoldId: id })}
								onMouseLeave={() => this.setState({ activeHoldId: null })}
								active={activeHoldId === id}
								gray={!(index % 2)}
								key={id}
								actions={[
									{ name: "Split", iconUrl: "/icons/split-gray.svg" },
									{ name: "Link", iconUrl: "/icons/link-gray.svg" },
									{ name: "Edit", iconUrl: "/icons/edit-gray.svg" },
									{ name: "Delete", iconUrl: "/icons/delete-gray.svg" }
								]}
							>
								{tds}
							</HoldRow>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No holds created yet</Typography>;
		}
	}

	render() {
		const { eventName } = this.state;
		const { classes } = this.props;

		return (
			//TODO eventually this component will move to it's own component
			<div>
				<PageHeading iconUrl="/icons/events-multi.svg">{eventName}</PageHeading>
				<Card className={classes.paper}>
					<CardContent>
						<Typography variant="title">Manage Ticket Holds</Typography>
						<Divider style={{ marginBottom: 40 }} />

						{this.renderList()}
					</CardContent>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(TicketHoldList);
