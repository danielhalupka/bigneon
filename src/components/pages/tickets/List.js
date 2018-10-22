import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import moment from "moment";

import notifications from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";
import TicketGroup from "./TicketGroup";
import TransferTicketsDialog from "./TransferTicketsDialog";
import SelectGroup from "../../common/form/SelectGroup";
import TicketDialog from "./TicketDialog";

const styles = theme => ({});

class TicketList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showTicketsFor: "upcoming",
			ticketGroups: null,
			filteredTicketGroups: null,
			expandedTicketGroupId: null,
			selectedTransferTicketIds: null,
			selectedTicket: null
		};
	}

	componentDidMount() {
		Bigneon()
			.tickets.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				let ticketGroups = [];

				//TODO api data structure will eventually change
				data.forEach(ticketGroup => {
					const event = ticketGroup[0];
					const tickets = ticketGroup[1];

					event.formattedData = moment
						.utc(event.event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
						.format("dddd, MMM D");

					ticketGroups.push({ event, tickets });
				});

				this.setState({ ticketGroups }, this.filterTicketGroups.bind(this));
			})
			.catch(error => {
				console.error(error);
				let message = "Loading tickets failed.";
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

	filterTicketGroups() {
		const { ticketGroups, showTicketsFor } = this.state;

		if (ticketGroups === null) {
			return this.setState({ filteredTicketGroups: null });
		}

		let filteredTicketGroups = [];
		ticketGroups.forEach(ticketGroup => {
			const { event } = ticketGroup;
			const { id, name, event_start } = event;

			const eventStartDate = moment.utc(
				event_start,
				moment.HTML5_FMT.DATETIME_LOCAL_MS
			);

			const timeDifference = moment.utc().diff(eventStartDate);
			let includeTicketGroup = false;

			if (showTicketsFor === "all") {
				includeTicketGroup = true;
			}

			if (showTicketsFor === "upcoming" && timeDifference < 0) {
				includeTicketGroup = true;
			}

			if (showTicketsFor === "past" && timeDifference > 0) {
				includeTicketGroup = true;
			}

			if (includeTicketGroup) {
				filteredTicketGroups.push(ticketGroup);
			}
		});

		return this.setState({ filteredTicketGroups });
	}

	renderTickets() {
		const {
			expandedTicketGroupId,
			showTicketsFor,
			filteredTicketGroups
		} = this.state;

		if (filteredTicketGroups === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (filteredTicketGroups.length > 0) {
			return filteredTicketGroups.map(ticketGroup => {
				const { event } = ticketGroup;
				const { id, name, event_start } = event;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<TicketGroup
							{...ticketGroup}
							expanded={expandedTicketGroupId === id}
							onExpandedChange={() => {
								if (expandedTicketGroupId === id) {
									this.setState({ expandedTicketGroupId: null });
								} else {
									this.setState({ expandedTicketGroupId: id });
								}
							}}
							onTicketSelect={selectedTicket =>
								this.setState({ selectedTicket, selectedEventName: name })
							}
							onShowTransferQR={selectedTransferTicketIds =>
								this.setState({ selectedTransferTicketIds })
							}
						/>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">
						No tickets for {showTicketsFor} events
					</Typography>
				</Grid>
			);
		}
	}

	renderSelectFilter() {
		const { showTicketsFor } = this.state;

		const filterOptions = {
			all: "All events",
			upcoming: "Upcoming events",
			past: "Past events"
		};

		return (
			<SelectGroup
				value={showTicketsFor}
				items={filterOptions}
				name={"venues"}
				label={"Filter tickets by"}
				onChange={e => {
					const showTicketsFor = e.target.value;
					this.setState({ showTicketsFor }, this.filterTicketGroups.bind(this));
				}}
			/>
		);
	}

	render() {
		const {
			selectedEventName,
			selectedTicket,
			selectedTransferTicketIds
		} = this.state;

		return (
			<div>
				<Typography variant="display3">My tickets</Typography>
				{this.renderSelectFilter()}
				<TicketDialog
					open={!!selectedTicket}
					eventName={selectedEventName}
					ticket={selectedTicket}
					onClose={() => this.setState({ selectedTicket: null })}
				/>
				<TransferTicketsDialog
					open={!!selectedTransferTicketIds}
					ticketIds={selectedTransferTicketIds}
					onClose={() => this.setState({ selectedTransferTicketIds: null })}
				/>

				<Grid container spacing={24}>
					{this.renderTickets()}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(TicketList);
