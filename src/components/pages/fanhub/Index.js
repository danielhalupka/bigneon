import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { observer } from "mobx-react";

import EventTicketsCard from "./EventTicketsCard";
import TransferTicketsDialog from "./TransferTicketsDialog";
import TicketDialog from "./TicketDialog";
import PageHeading from "../../elements/PageHeading";
import layout from "../../../stores/layout";
import AppPromoCard from "../../elements/AppPromoCard";
import tickets from "../../../stores/tickets";

const styles = theme => ({});

@observer
class FanHub extends Component {
	constructor(props) {
		super(props);

		this.state = {
			expandedEventId: null,
			selectedTransferTicketIds: null,
			selectedTicket: null
		};
	}

	componentDidMount() {
		layout.toggleSideMenu(true);
		tickets.refreshTickets();
	}

	componentDidUpdate(prevProps) {
		let expandedEventId = null;
		if (this.props.match && this.props.match.params) {
			const { eventId } = this.props.match.params;
			if (
				prevProps.match &&
				prevProps.match.params &&
				prevProps.match.params.eventId === eventId
			) {
				if (!(prevProps.match.params.eventId && !this.state.expandedEventId)) {
					return;
				}
			}
			expandedEventId = eventId;
		}
		this.setState({ expandedEventId });
	}

	renderTickets() {
		const { expandedEventId } = this.state;
		const { groups, ticketGroupCount } = tickets;
		const { history } = this.props;

		if (groups === null) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">Loading...</Typography>
				</Grid>
			);
		}

		if (ticketGroupCount > 0) {
			return groups.map(ticketGroup => {
				const { event } = ticketGroup;
				const { id, name } = event;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<EventTicketsCard
							{...ticketGroup}
							expanded={expandedEventId === id}
							onTicketSelect={selectedTicket =>
								this.setState({ selectedTicket, selectedEventName: name })
							}
							onShowTransferQR={selectedTransferTicketIds =>
								this.setState({ selectedTransferTicketIds })
							}
							history={history}
						/>
					</Grid>
				);
			});
		} else {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Typography variant="body1">No tickets for events.</Typography>
				</Grid>
			);
		}
	}

	render() {
		const {
			selectedEventName,
			selectedTicket,
			selectedTransferTicketIds
		} = this.state;

		return (
			<div>
				<PageHeading iconUrl="/icons/fan-hub-multi.svg">
					Upcoming events
				</PageHeading>
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

				<AppPromoCard style={{ marginTop: 20 }} />
			</div>
		);
	}
}

export default withStyles(styles)(FanHub);
