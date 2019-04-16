import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { observer } from "mobx-react";

import EventTicketsCard from "./EventTicketsCard";
import TransferTicketsDialog from "./TransferTicketsDialog";
import TicketDialog from "./TicketDialog";
import PageHeading from "../../elements/PageHeading";
import AppPromoCard from "../../elements/AppPromoCard";
import tickets from "../../../stores/tickets";
import Loader from "../../elements/loaders/Loader";
import Card from "../../elements/Card";
import StyledLink from "../../elements/StyledLink";
import changeUrlParam from "../../../helpers/changeUrlParam";
import getUrlParam from "../../../helpers/getUrlParam";

const styles = theme => ({
	menuContainer: {
		display: "flex",
		padding: theme.spacing.unit * 2.5
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	}
});

@observer
class MyEvents extends Component {
	constructor(props) {
		super(props);

		this.state = {
			expandedEventId: "",
			selectedTransferTicketIds: null,
			selectedTicket: null,
			type: "upcoming"
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.eventId
		) {
			this.setState({ expandedEventId: this.props.match.params.eventId });
		}

		const expandedEventId = getUrlParam("event_id") || "";
		const type = getUrlParam("type") || this.state.type;

		this.setState({ type, expandedEventId });
		tickets.refreshTickets(type);
	}

	onExpandTickets(eventId) {
		let expandedEventId = eventId;
		//If it's already selected, close it
		if (eventId === this.state.expandedEventId) {
			expandedEventId = "";
		}

		this.setState({ expandedEventId });
		changeUrlParam("event_id", expandedEventId);
	}

	changeListType(type) {
		if (type !== this.state.type) {
			changeUrlParam("event_id", "");
		}

		this.setState({ expandedEventId: null, type });
		changeUrlParam("type", type);
		tickets.refreshTickets(type);
	}

	renderTickets() {
		const { expandedEventId, type } = this.state;
		const { history } = this.props;

		let groups;
		let showActions = false;
		if (!type || type === "upcoming") {
			groups = tickets.upcomingGroups;
			showActions = true;
		} else if (type === "past") {
			groups = tickets.pastGroups;
		}

		if (groups === null || groups === undefined) {
			return (
				<Grid item xs={12} sm={12} lg={12}>
					<Loader/>
				</Grid>
			);
		}

		if (groups.length > 0) {
			return groups.map(ticketGroup => {
				const { event } = ticketGroup;
				const { id, name } = event;

				return (
					<Grid key={id} item xs={12} sm={12} lg={12}>
						<EventTicketsCard
							{...ticketGroup}
							expanded={expandedEventId === id}
							showActions={showActions}
							onTicketSelect={selectedTicket =>
								this.setState({ selectedTicket, selectedEventName: name })
							}
							onShowTransferQR={selectedTransferTicketIds =>
								this.setState({ selectedTransferTicketIds })
							}
							history={history}
							onExpand={() => this.onExpandTickets(id)}
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
			selectedTransferTicketIds,
			type
		} = this.state;

		const { classes } = this.props;

		return (
			<div>
				<PageHeading iconUrl="/icons/my-events-multi.svg">
					My events
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
					<Grid item xs={12} sm={12} lg={12}>
						<Card variant="block" style={{ borderRadius: "6px 6px 0 0" }}>
							<div className={classes.menuContainer}>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={type === "upcoming"}
										onClick={() => this.changeListType("upcoming")}
									>
										Upcoming
									</StyledLink>
								</Typography>

								<Typography className={classes.menuText}>
									<StyledLink
										underlined={type === "past"}
										onClick={() => this.changeListType("past")}
									>
										Past
									</StyledLink>
								</Typography>
							</div>
						</Card>
					</Grid>

					{this.renderTickets()}
				</Grid>

				<AppPromoCard style={{ marginTop: 20 }}/>
			</div>
		);
	}
}

export default withStyles(styles)(MyEvents);
