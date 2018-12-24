import React, { Component } from "react";
import { Typography, withStyles, Grid } from "@material-ui/core";
import { observer } from "mobx-react";

import Bigneon from "../../../../helpers/bigneon";
import notifications from "../../../../stores/notifications";
import boxOffice from "../../../../stores/boxOffice";
import GuestRow from "./GuestRow";
import BoxInput from "../../../elements/form/BoxInput";
import BottomCompleteOrderBar from "../common/BottomCompleteOrderBar";
import CheckingInDialog from "./CheckingInDialog";
import user from "../../../../stores/user";
import NotFound from "../../../common/NotFound";
import layout from "../../../../stores/layout";
import BlankSlate from "../common/BlankSlate";

const styles = theme => ({
	root: {},
	filterOptions: {
		marginBottom: theme.spacing.unit * 2
	}
});

@observer
class GuestList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			filteredGuests: null,
			searchQuery: "",
			expandedUserId: null,
			selectedTickets: {},
			isCheckingIn: false,
			showCheckingInDialog: false
		};

		this.onExpandChange = this.onExpandChange.bind(this);
		this.onTicketSelect = this.onTicketSelect.bind(this);
	}

	componentDidMount() {
		boxOffice.refreshEventTickets();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	stringContainedInArray(strList, searchQuery) {
		for (let index = 0; index < strList.length; index++) {
			const str = strList[index].toLowerCase();

			if (str.includes(searchQuery.toLowerCase())) {
				return true;
			}
		}

		return false;
	}

	filterGuestsOnQuery(e) {
		this.setState({
			searchQuery: e.target.value,
			expandedUserId: null,
			selectedTickets: {}
		});
	}

	filteredGuests() {
		const { guests } = boxOffice;
		if (!guests) {
			return {};
		}

		const { searchQuery } = this.state;

		//Filtering required
		let filteredGuests = {};
		Object.keys(guests).forEach(user_id => {
			const { first_name, last_name, tickets } = guests[user_id];
			let ticketIds = [];
			tickets.forEach(({ id }) => {
				ticketIds.push(id);
			});

			if (
				this.stringContainedInArray(
					[first_name, last_name, ...ticketIds],
					searchQuery
				)
			) {
				filteredGuests[user_id] = guests[user_id];
			}
		});

		return filteredGuests;
	}

	onExpandChange(expandedUserId) {
		this.setState({ expandedUserId, selectedTickets: {} });
	}

	onTicketSelect({ id, ...ticket }) {
		this.setState(({ selectedTickets }) => {
			if (selectedTickets[id]) {
				delete selectedTickets[id];
			} else {
				selectedTickets[id] = ticket;
			}

			return { selectedTickets };
		});
	}

	async redeemSingleTicket({ id, redeem_key, event_id }) {
		return new Promise(function(resolve, reject) {
			Bigneon()
				.events.tickets.redeem({
					event_id,
					ticket_id: id,
					redeem_key
				})
				.then(response => {
					resolve({ result: response });
				})
				.catch(error => {
					resolve({ error });
				});
		});
	}

	async onRedeemSelectedTickets() {
		this.setState({ isCheckingIn: true, showCheckingInDialog: true });

		const { selectedTickets } = this.state;
		const ticketIds = Object.keys(selectedTickets);

		for (let index = 0; index < ticketIds.length; index++) {
			const id = ticketIds[index];

			const { error } = await this.redeemSingleTicket({
				id,
				...selectedTickets[id]
			});

			if (error) {
				console.error(error);
				this.setState({ isCheckingIn: false });
				notifications.showFromErrorResponse({
					defaultMessage: "Redeeming ticket failed.",
					error
				});
			}
		}

		this.setState({ isCheckingIn: false, selectedTickets: {} });
		boxOffice.refreshGuests();
	}

	renderBottomBar() {
		const {
			selectedTickets,
			isCheckingIn,
			showCheckingInDialog,
			expandedUserId
		} = this.state;

		const { guests } = boxOffice;

		let totalAvailable = 0;
		if (guests && guests[expandedUserId]) {
			const { tickets } = guests[expandedUserId];
			tickets.forEach(({ status }) => {
				if (status !== "Redeemed") {
					totalAvailable++;
				}
			});
		}

		let totalNumberSelected = Object.keys(selectedTickets).length;

		Object.keys(selectedTickets).forEach(id => {});

		const buttonText = `Check in ${
			totalNumberSelected ? totalNumberSelected : ""
		} ticket${totalNumberSelected > 1 ? "s" : ""}`;

		return (
			<div>
				<CheckingInDialog
					open={!!showCheckingInDialog}
					onClose={() => this.setState({ showCheckingInDialog: false })}
					isCheckingIn={isCheckingIn}
				/>
				<BottomCompleteOrderBar
					col1Text={`Total tickets available: ${totalAvailable}`}
					col3Text={`Total tickets selected: ${totalNumberSelected}`}
					disabled={isCheckingIn || !(totalNumberSelected > 0)}
					onSubmit={this.onRedeemSelectedTickets.bind(this)}
					buttonText={buttonText}
					disabledButtonText={
						totalNumberSelected > 0 ? "Checking in..." : "Check in"
					}
				/>
			</div>
		);
	}

	render() {
		if (!layout.allowedBoxOffice) {
			return <NotFound />;
		}

		if (!boxOffice.availableEvents || boxOffice.availableEvents < 1) {
			return <BlankSlate>No active events found.</BlankSlate>;
		}

		if (!boxOffice.activeEventId) {
			return <BlankSlate>No active event selected.</BlankSlate>;
		}

		if (!boxOffice.guests || boxOffice.guests === {}) {
			return <BlankSlate>No guests found for event.</BlankSlate>;
		}

		const { searchQuery, expandedUserId, selectedTickets } = this.state;

		const { classes } = this.props;

		const filteredGuests = this.filteredGuests();

		if (filteredGuests === null) {
			return <Typography>Loading...</Typography>;
		}

		return (
			<div>
				<Grid className={classes.filterOptions} container>
					<Grid item xs={12} sm={12} md={6} lg={4}>
						<BoxInput
							name="Search"
							value={searchQuery}
							placeholder="Search by guest name or order #"
							onChange={this.filterGuestsOnQuery.bind(this)}
						/>
					</Grid>
				</Grid>

				{Object.keys(filteredGuests).map((id, index) => {
					const expanded = id === expandedUserId;
					return (
						<GuestRow
							key={id}
							index={index}
							userId={id}
							{...filteredGuests[id]}
							onExpandChange={this.onExpandChange}
							expanded={expanded}
							onTicketSelect={this.onTicketSelect}
							selectedTickets={expanded ? selectedTickets : {}}
						/>
					);
				})}

				{this.renderBottomBar()}
			</div>
		);
	}
}

export default withStyles(styles)(GuestList);
