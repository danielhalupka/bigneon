import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import Divider from "../../../../../common/Divider";
import StyledLink from "../../../../../elements/StyledLink";
import HoldRow from "./HoldRow";
import HoldDialog, { HOLD_TYPES } from "./HoldDialog";
import Container from "../Container";

const styles = theme => ({
	root: {}
});

class TicketHoldList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			holdType: HOLD_TYPES.NEW,
			activeHoldId: null,
			showHoldDialog: null,
			ticketTypes: [],
			holds: []
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.eventId);

		this.refreshHolds();
	}

	loadEventDetails(id) {
		Bigneon()
			.events.read({ id })
			.then(response => {
				const { ticket_types } = response.data;
				this.setState({
					ticketTypes: ticket_types
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event details failed."
				});
			});
	}

	refreshHolds() {
		Bigneon()
			.events.holds.index({ event_id: this.eventId })
			.then(holds => {
				//TODO Pagination
				this.setState({ holds: holds.data.data });
			});
	}

	onAddHold() {
		this.setState({
			activeHoldId: null,
			holdType: HOLD_TYPES.NEW,
			showHoldDialog: "-1"
		});
	}

	deleteHold(id) {
		Bigneon()
			.holds.delete({ id })
			.then(response => {
				this.refreshHolds();
				notifications.show({ message: "Hold deleted.", variant: "success" });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to delete hold."
				});
			});
	}

	renderList() {
		const { holds, activeHoldId, showHoldDialog } = this.state;

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
				"Action"
			];

			const onAction = (id, action) => {
				if (action === "Edit") {
					return this.setState({
						activeHoldId: id,
						showHoldDialog: true,
						holdType: HOLD_TYPES.EDIT
					});
				}
				if (action === "Split") {
					return this.setState({
						activeHoldId: id,
						showHoldDialog: true,
						holdType: HOLD_TYPES.SPLIT
					});
				}

				if (action === "Delete") {
					return this.deleteHold(id);
				}
			};

			return (
				<div>
					<HoldRow heading>{ths}</HoldRow>
					{holds.map((ticket, index) => {
						const {
							id,
							name,
							redemption_code,
							hold_type,
							quantity,
							available
						} = ticket;

						const tds = [
							<StyledLink
								underlined
								key={id}
								to={`/admin/events/${this.eventId}/dashboard/comps/${id}`}
							>
								{name}
							</StyledLink>,
							redemption_code,
							hold_type,
							quantity - available,
							available
						];

						const active = activeHoldId === id && showHoldDialog;
						const iconColor = active ? "white" : "gray";
						return (
							<HoldRow
								// onMouseEnter={e => this.setState({ hoverId: id })}
								// onMouseLeave={e => this.setState({ hoverId: null })}
								active={active}
								gray={!(index % 2)}
								key={id}
								actions={[
									{
										id: id,
										name: "Split",
										iconUrl: `/icons/split-${iconColor}.svg`,
										onClick: onAction.bind(this)
									},
									{
										id: id,
										name: "Link",
										iconUrl: `/icons/link-${iconColor}.svg`,
										onClick: onAction.bind(this)
									},
									{
										id: id,
										name: "Edit",
										iconUrl: `/icons/edit-${iconColor}.svg`,
										onClick: onAction.bind(this)
									},
									{
										id: id,
										name: "Delete",
										iconUrl: `/icons/delete-${iconColor}.svg`,
										onClick: onAction.bind(this)
									}
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
		const { ticketTypes, activeHoldId, holdType } = this.state;

		return (
			<HoldDialog
				holdType={holdType}
				open={true}
				eventId={this.eventId}
				holdId={activeHoldId}
				ticketTypes={ticketTypes}
				onSuccess={id => {
					this.refreshHolds();
					this.setState({ showHoldDialog: null });
				}}
				onClose={() => this.setState({ showHoldDialog: null })}
			/>
		);
	}

	render() {
		const { showHoldDialog } = this.state;
		const { classes } = this.props;

		return (
			<Container eventId={this.eventId} subheading={"tools"}>
				{showHoldDialog && this.renderDialog()}
				<div style={{ display: "flex" }}>
					<Typography variant="title">Manage Ticket Holds</Typography>
					<span style={{ flex: 1 }} />
					<Button onClick={e => this.onAddHold()}>Create Hold</Button>
				</div>

				<Divider style={{ marginBottom: 40 }} />

				{this.renderList()}
			</Container>
		);
	}
}

export default withStyles(styles)(TicketHoldList);
