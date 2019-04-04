import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import Divider from "../../../../../common/Divider";
import Container from "../Container";
import Dialog from "../../../../../elements/Dialog";
import Loader from "../../../../../elements/loaders/Loader";
import user from "../../../../../../stores/user";
import CodeRow from "./CodeRow";
import CodeDialog, { CODE_TYPES } from "./CodeDialog";

const styles = theme => ({
	root: {}
});

class CodeList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			activeCodeId: null,
			showCodeDialog: null,
			redemptionCodes: [],
			ticketTypes: {},
			codes: [],
			deleteId: null
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.eventId);

		this.refreshCodes();
	}

	loadEventDetails(id) {
		Bigneon()
			.events.ticketTypes.index({ event_id: id })
			.then(response => {
				const { data } = response.data;

				const ticketTypes = {};
				data.forEach(ticketType => {
					if (ticketType.status !== "Cancelled") {
						ticketTypes[ticketType.id] = ticketType;
					}
				});

				this.setState({ ticketTypes });
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

	refreshCodes() {
		Bigneon()
			.events.codes.index({ event_id: this.eventId })
			.then(codes => {
				//TODO Pagination
				this.setState({ codes: codes.data.data });
			});
	}

	onAddCode() {
		this.setState({
			activeCodeId: null,
			showCodeDialog: "-1",
			codeType: CODE_TYPES.NEW
		});
	}

	deleteCode(id) {
		Bigneon()
			.codes.delete({ id })
			.then(response => {
				this.refreshCodes();
				notifications.show({ message: "Code deleted.", variant: "success" });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to delete code."
				});
			});
	}

	renderList() {
		const { codes, activeCodeId, showCodeDialog, ticketTypes } = this.state;
		console.log(ticketTypes);
		if (codes === null) {
			return <Loader/>;
		}

		if (codes && codes.length > 0) {
			const ths = ["Name", "Codes", "Ticket Types", "Discount", "Available"];

			const onAction = (id, action) => {
				if (action === "Edit") {
					return this.setState({
						activeCodeId: id,
						showCodeDialog: true,
						codeType: CODE_TYPES.EDIT
					});
				}

				if (action === "Delete") {
					return this.setState({ deleteId: id });
				}
			};

			return (
				<div>
					<CodeRow heading>{ths}</CodeRow>
					{codes.map((c, index) => {
						const {
							id,
							name,
							redemption_codes,
							ticket_type_ids,
							discount_in_cents,
							discount_as_percentage,
							max_uses
						} = c;

						const ticketTypesList = [];
						let ticketTypeDisplayList = "";
						if (Object.keys(ticketTypes).length > 0) {
							ticket_type_ids.forEach((id) => {
								ticketTypesList.push(ticketTypes[id].name);
							});
							ticketTypesList.sort();
							ticketTypesList.forEach((name, idx) => {
								ticketTypeDisplayList += name;
								if (idx < ticketTypesList.length - 1) {
									ticketTypeDisplayList += ", ";
								}
							});
						}

						const tds = [
							name,
							redemption_codes,
							Object.keys(ticketTypes).length === 0
								? null
								: ticketTypeDisplayList,
							discount_in_cents ? "$ " + (discount_in_cents / 100).toFixed(2) : discount_as_percentage + "%",
							max_uses === 0 ? "∞" : max_uses
						];

						const active = activeCodeId === id && showCodeDialog;
						const iconColor = active ? "white" : "gray";
						return (
							<CodeRow
								// onMouseEnter={e => this.setState({ hoverId: id })}
								// onMouseLeave={e => this.setState({ hoverId: null })}
								active={active}
								gray={!(index % 2)}
								key={id}
								actions={
									user.hasScope("code:write")
										? [
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
										  ]
										: []
								}
							>
								{tds}
							</CodeRow>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No codes created yet</Typography>;
		}
	}

	renderDialog() {
		const { ticketTypes, activeCodeId, codeType } = this.state;

		return (
			<CodeDialog
				codeType={codeType}
				open={true}
				eventId={this.eventId}
				codeId={activeCodeId}
				ticketTypes={Object.values(ticketTypes)}
				onSuccess={id => {
					this.refreshCodes();
					this.setState({ showCodeDialog: null });
				}}
				onClose={() => this.setState({ showCodeDialog: null })}
			/>
		);
	}

	renderDeleteDialog() {
		const { deleteId } = this.state;

		const onClose = () => this.setState({ deleteId: null });

		return (
			<Dialog title={"Delete code?"} open={!!deleteId} onClose={onClose}>
				<div>
					<Typography>Are you sure you want to delete this code?</Typography>

					<br/>
					<br/>
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1, marginRight: 5 }} onClick={onClose}>
							Cancel
						</Button>
						<Button
							style={{ flex: 1, marginLeft: 5 }}
							onClick={() => {
								this.deleteCode(deleteId);
								onClose();
							}}
						>
							Delete
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	render() {
		const { showCodeDialog } = this.state;
		const { classes } = this.props;

		return (
			<Container eventId={this.eventId} subheading={"tools"} useCardContainer>
				{showCodeDialog && this.renderDialog()}
				{this.renderDeleteDialog()}
				<div style={{ display: "flex" }}>
					<Typography variant="title">Discount Codes</Typography>
					<span style={{ flex: 1 }}/>
					{user.hasScope("code:write") ? (
						<Button onClick={e => this.onAddCode()}>New Discount Code</Button>
					) : (
						<span/>
					)}
				</div>

				<Divider style={{ marginBottom: 40 }}/>

				{this.renderList()}
			</Container>
		);
	}
}

export default withStyles(styles)(CodeList);
