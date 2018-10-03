import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import QRCode from "qrcode.react";

import { primaryHex, textColorSecondary } from "../../styles/theme";
import DialogTransition from "../../common/DialogTransition";
import Typography from "@material-ui/core/Typography";
import SelectGroup from "../../common/form/SelectGroup";

const styles = {
	dialogContent: {
		//width: "50%"
	}
};

class TicketDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedTicketId: ""
		};
	}

	renderTicketsSelect() {
		const { tickets } = this.props;
		const { selectedTicketId } = this.state;

		const ticketsObj = {};

		let label = "";

		let index = 0;
		if (tickets) {
			tickets.forEach(ticket => {
				index++;
				ticketsObj[ticket.id] = `${ticket.ticket_type_name} (${index})`;
			});
			label = "Ticket";
		} else {
			label = "Loading tickets...";
		}

		return (
			<SelectGroup
				value={selectedTicketId}
				items={ticketsObj}
				name={"tickets"}
				missingItemsLabel={"No available tickets"}
				label={label}
				onChange={e => {
					const selectedTicketId = e.target.value;
					this.setState({ selectedTicketId });
				}}
			/>
		);
	}

	componentDidUpdate(prevProps) {
		const { tickets, eventName } = this.props;

		if (eventName !== prevProps.eventName) {
			this.setState({ selectedTicketId: tickets[0].id });
		}
	}

	render() {
		const { selectedTicketId } = this.state;
		const { tickets, eventName, classes, onClose, ...other } = this.props;

		const selectedTicket = tickets ? tickets[0] : {};

		const { id, ticket_type_name } = selectedTicket;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={onClose}
				aria-labelledby="dialog-title"
				{...other}
			>
				{/* <DialogTitle id="dialog-title">
					{eventName}
					<br />

					{`Ticket: ${ticket_type_name}`}
				</DialogTitle> */}

				<DialogContent>
					<Typography variant="display1">{eventName}</Typography>
					{this.renderTicketsSelect()}
					{selectedTicketId ? (
						<div style={{ alignContent: "center", justifyContent: "center" }}>
							<QRCode
								size={300}
								fgColor={primaryHex}
								value={selectedTicketId || ""}
							/>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		);
	}
}

TicketDialog.propTypes = {
	id: PropTypes.string,
	tickets: PropTypes.array,
	eventName: PropTypes.string,
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(TicketDialog);
