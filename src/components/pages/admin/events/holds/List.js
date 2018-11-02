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
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton/IconButton";
import HoldDialog from "./HoldDialog";



const styles = theme => ({
	paper: {}
});

class TicketHoldList extends Component {
	constructor(props) {
		super(props);


		this.state = {
			activeHoldId: null,
			showHoldDialog: null,
			eventName: "",
			ticketTypes: [],
			holds: []
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
				const { name, ticket_types } = response.data;
				this.setState({
					eventName: name,
					ticketTypes: ticket_types
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
			Bigneon().events.holds.index({ event_id: this.eventId }).then(holds => {
				//TODO Pagination
				this.setState({ holds: holds.data.data });
			});
		}
	}

	onAddHold() {
		this.setState({
			showHoldDialog: "-1"
		});
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

			const onAction = (action) => {
				if (action === "Edit") {
					this.setState({ showHoldDialog: true })
				}
				console.log(action, activeHoldId);
			};

			return (
				<div>
					<HoldRow heading>{ths}</HoldRow>
					{holds.map((ticket, index) => {
						const { id, name, redemption_code, ticket_type, total_held, claimed } = ticket;

						const tds = [
							name,
							redemption_code,
							ticket_type,
							total_held,
							claimed,
							`${total_held - claimed}`
						];

						return (
							<HoldRow
								// onClick={() => this.setState({ showHoldDialog: true })}
								onMouseEnter={() => this.setState({ activeHoldId: id })}
								onMouseLeave={() => this.setState({ activeHoldId: null })}
								active={activeHoldId === id}
								gray={!(index % 2)}
								key={id}
								actions={[
									{ name: "Split", iconUrl: "/icons/split-gray.svg", onClick: onAction.bind(this) },
									{ name: "Link", iconUrl: "/icons/link-gray.svg", onClick: onAction.bind(this) },
									{ name: "Edit", iconUrl: "/icons/edit-gray.svg", onClick: onAction.bind(this) },
									{ name: "Delete", iconUrl: "/icons/delete-gray.svg", onClick: onAction.bind(this) }
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


	renderDialog() {
		const { ticketTypes, activeHoldId } = this.state;
		let eventId = this.eventId;
		return (
			<HoldDialog
				open={true}
				eventId={eventId}
				holdId={activeHoldId}
				ticketTypes={ticketTypes}
				onSuccess={(id) => {
					this.setState({ showHoldDialog: null });
				}}
				onClose={() => this.setState({ showHoldDialog: null })}
			/>
		);
	}

	render() {
		const { eventName, showHoldDialog } = this.state;
		const { classes } = this.props;

		return (
			//TODO eventually this component will move to it's own component
			<div>

				<PageHeading iconUrl="/icons/events-multi.svg">{eventName}</PageHeading>
				{ showHoldDialog && this.renderDialog() }

				<Card className={classes.paper}>
					<CardContent>
						<div style={{ display: "flex" }}>
							<Typography variant="title">Manage Ticket Holds</Typography>
							<span style={{ flex: 1 }}></span>
							<Button onClick={e => this.onAddHold()}>Create Hold</Button>
						</div>

						<Divider style={{ marginBottom: 40 }}/>

						{this.renderList()}
					</CardContent>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(TicketHoldList);
