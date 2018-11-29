import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import Bigneon from "../../../helpers/bigneon";
import notifications from "../../../stores/notifications";
import PageHeading from "../../elements/PageHeading";
import boxOffice from "../../../stores/boxOffice";
import TicketRow from "./TicketRow";
import BottomCheckoutBar from "./BottomCheckoutBar";
import CheckoutDialog from "./CheckoutDialog";

const styles = theme => ({
	root: {}
});

class TicketSales extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ticketTypes: null,
			selectedTickets: {},
			showCheckoutModal: false
		};
	}

	componentDidMount() {
		this.loadTicketTypes();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	loadTicketTypes() {
		const { activeEventId } = boxOffice;
		if (!activeEventId) {
			this.timeout = setTimeout(this.loadTicketTypes.bind(this), 500);
			return;
		}

		Bigneon()
			.events.read({ id: activeEventId })
			.then(response => {
				const { ticket_types } = response.data;

				let ticketTypes = {};
				ticket_types.forEach(({ id, ...ticket_type }) => {
					ticketTypes[id] = ticket_type;
				});

				this.setState({ ticketTypes });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event ticket types failed."
				});
			});
	}

	renderTicketTypes() {
		const { ticketTypes, selectedTickets } = this.state;

		if (ticketTypes === null) {
			return <Typography>Loading...</Typography>;
		}

		const ticketTypeIds = Object.keys(ticketTypes);

		if (ticketTypeIds.length === 0) {
			return <Typography />;
		}

		return ticketTypeIds.map(id => {
			const { name, available, ticket_pricing, ...rest } = ticketTypes[id];

			const { price_in_cents } = ticket_pricing;

			return (
				<TicketRow
					key={id}
					iconUrl="/icons/tickets-gray.svg"
					name={name}
					available={available}
					priceInCents={price_in_cents}
					value={selectedTickets[id]}
					onChange={value => {
						this.setState(({ selectedTickets }) => {
							return { selectedTickets: { ...selectedTickets, [id]: value } };
						});
					}}
				/>
			);
		});
	}

	render() {
		const { ticketTypes, selectedTickets, showCheckoutModal } = this.state;

		let totalNumberSelected = 0;
		let totalInCents = 0;

		Object.keys(selectedTickets).forEach(id => {
			if (selectedTickets[id] > 0) {
				const { ticket_pricing } = ticketTypes[id];
				totalNumberSelected = totalNumberSelected + selectedTickets[id];
				totalInCents =
					totalInCents + ticket_pricing.price_in_cents * selectedTickets[id];
			}
		});

		return (
			<div>
				<PageHeading iconUrl="/icons/tickets-active.svg">
					General public
				</PageHeading>
				{this.renderTicketTypes()}

				<CheckoutDialog
					open={showCheckoutModal}
					onClose={() => this.setState({ showCheckoutModal: false })}
				/>

				<BottomCheckoutBar
					totalNumberSelected={totalNumberSelected}
					totalInCents={totalInCents}
					onCheckout={() => this.setState({ showCheckoutModal: true })}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(TicketSales);
