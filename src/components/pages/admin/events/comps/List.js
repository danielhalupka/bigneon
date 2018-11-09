import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import notifications from "../../../../../stores/notifications";
import Button from "../../../../elements/Button";
import Bigneon from "../../../../../helpers/bigneon";
import PageHeading from "../../../../elements/PageHeading";
import Divider from "../../../../common/Divider";
import HoldRow from "./CompRow";
import CompDialog from "./CompDialog";

const styles = theme => ({
	paper: {}
});

class CompList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeHoldId: null,
			showDialog: null,
			eventName: "",
			ticketTypes: [],
			comps: [],
			holdDetails: {}
		};
	}

	componentDidMount() {
		const { match } = this.props;

		if (match && match.params && match.params.id) {
			this.eventId = match.params.id;
			this.holdId = match.params.holdId;
			this.loadEventDetails();
			this.loadHoldDetails();
			this.refreshComps();
		} else {
			//TODO 404
		}
	}

	async loadHoldDetails() {
		let holdDetails = (await Bigneon().holds.read({ id: this.holdId })).data;
		this.setState({ holdDetails });
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

	refreshComps() {
		if (this.eventId && this.holdId) {
			Bigneon()
				.holds.comps.index({ hold_id: this.holdId })
				.then(comps => {
					//TODO Pagination
					this.setState({ comps: comps.data.data });
				});
		}
	}

	onAddHold() {
		this.setState({
			activeHoldId: null,
			showDialog: "-1"
		});
	}

	renderList() {
		const { comps, hoverId } = this.state;
		const { classes } = this.props;

		if (comps === null) {
			return <Typography variant="body1">Loading...</Typography>;
		}

		if (comps && comps.length > 0) {
			const ths = [
				"Name",
				"Code",
				"Status",
				"Total Held",
				"Claimed",
				"Remaining",
				"Action"
			];

			const onAction = (id, action) => {
				// if (action === "Edit") {
				// 	this.setState({ activeHoldId: id, showDialog: true, holdType: HOLD_TYPES.EDIT })
				// }
				// if (action === "Split") {
				// 	this.setState({ activeHoldId: id, showDialog: true, holdType: HOLD_TYPES.SPLIT });
				// }
				// console.log(action, id);
			};

			return (
				<div>
					<HoldRow heading>{ths}</HoldRow>
					{comps.map((ticket, index) => {
						const {
							id,
							name,
							redemption_code,
							status = "Unclaimed",
							quantity,
							claimed = 0
						} = ticket;

						const tds = [
							name,
							redemption_code,
							status,
							quantity,
							claimed,
							`${quantity - claimed}`
						];

						const active = false; //Might use this later, right now no need to highlight
						const iconColor = active ? "white" : "gray";
						return (
							<HoldRow
								onMouseEnter={e => this.setState({ hoverId: id })}
								onMouseLeave={e => this.setState({ hoverId: null })}
								active={active}
								gray={!(index % 2)}
								key={id}
								actions={[
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
			return <Typography variant="body1">No comps created yet</Typography>;
		}
	}

	renderDialog() {
		const { ticketTypes, activeHoldId } = this.state;
		let eventId = this.eventId;
		let holdId = this.holdId;
		return (
			<CompDialog
				open={true}
				eventId={eventId}
				holdId={holdId}
				ticketTypes={ticketTypes}
				onSuccess={id => {
					this.refreshComps();
					this.setState({ showDialog: null });
				}}
				onClose={() => this.setState({ showDialog: null })}
			/>
		);
	}

	render() {
		const { eventName, showDialog, holdDetails } = this.state;
		const { classes } = this.props;

		return (
			//TODO eventually this component will move to it's own component
			<div>
				<PageHeading iconUrl="/icons/events-multi.svg">{eventName}</PageHeading>
				{showDialog && this.renderDialog()}

				<Card className={classes.paper}>
					<CardContent>
						<div style={{ display: "flex" }}>
							<Typography variant="title">{holdDetails.name}</Typography>
							<span style={{ flex: 1 }} />
							<Button onClick={e => this.onAddHold()}>
								Assign Name To List
							</Button>
						</div>

						<Divider style={{ marginBottom: 40 }} />

						{this.renderList()}
					</CardContent>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(CompList);
