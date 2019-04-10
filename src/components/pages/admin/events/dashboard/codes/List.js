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
import { secondaryHex } from "../../../../../../config/theme";

const styles = theme => ({
	root: {},
	shareableLinkContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	shareableLinkText: {
		color: secondaryHex,
		fontSize: theme.typography.fontSize * 0.9
	}
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

	onAddCode(type) {
		if (type === "discount") {
			this.setState({
				activeCodeId: null,
				showCodeDialog: "-1",
				codeType: CODE_TYPES.NEW_DISCOUNT
			});
		} else {
			this.setState({
				activeCodeId: null,
				showCodeDialog: "-1",
				codeType: CODE_TYPES.NEW_ACCESS
			});
		}
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

		if (codes === null) {
			return <Loader/>;
		}

		if (codes && codes.length > 0) {
			const ths = ["Name", "Codes", "Ticket Types", "Type",  "Total Used", "Discount", ""];

			const onAction = (id, action) => {
				if (action === "EditDiscount") {
					return this.setState({
						activeCodeId: id,
						showCodeDialog: true,
						codeType: CODE_TYPES.EDIT_DISCOUNT
					});
				}

				if (action === "EditAccess") {
					return this.setState({
						activeCodeId: id,
						showCodeDialog: true,
						codeType: CODE_TYPES.EDIT_ACCESS
					});
				}

				if (action === "Delete") {
					return this.setState({ deleteId: id });
				}

				if (action === "Link") {
					return this.setState({ showShareableLinkId: id });
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
							max_uses,
							available,
							code_type
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

						let discount_type;
						if (code_type === "Discount") {
							discount_type = "Discount";
						} else {
							discount_type = "Access";
						}

						let discount = "None";
						if (discount_in_cents) {
							discount = `$${(discount_in_cents / 100).toFixed(2)}`;
						} else if (discount_as_percentage) {
							discount = `${discount_as_percentage}%`;
						}

						const tds = [
							name,
							redemption_codes,
							ticketTypeDisplayList,
							discount_type,
							max_uses - available,
							discount
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
												name: "Link",
												iconUrl: `/icons/link-${iconColor}.svg`,
												onClick: onAction.bind(this)
											},
											{
												id: id,
												name: discount_type === "Discount" ? "EditDiscount" : "EditAccess",
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

	renderShareableLink() {
		const { showShareableLinkId } = this.state;
		const { classes } = this.props;

		const onClose = () => this.setState({ showShareableLinkId: null });

		const { codes } = this.state;

		const urls = [];
		if (showShareableLinkId) {
			const code = codes.find(c => c.id === showShareableLinkId);

			const { redemption_codes, event_id } = code;
			redemption_codes.forEach(c => {
				urls.push(`${window.location.protocol}//${window.location.host}/events/${event_id}/tickets?code=${c}`);
			});
		}

		return (
			<Dialog iconUrl={"/icons/link-white.svg"} title={`Shareable link${urls.length > 1 ? "s" : ""}`} open={!!showShareableLinkId} onClose={onClose}>
				<div>
					{urls.length > 0 ?
						urls.map((url, index) => (
							<div key={index} className={classes.shareableLinkContainer}>
								<a href={url} target={"_blank"} className={classes.shareableLinkText}>{url}</a>
							</div>
						)) : null }
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1 }} onClick={onClose}>
							Done
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	render() {
		const { showCodeDialog } = this.state;

		return (
			<Container eventId={this.eventId} subheading={"tools"} useCardContainer>
				{showCodeDialog && this.renderDialog()}
				{this.renderDeleteDialog()}
				{this.renderShareableLink()}
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<Typography variant="title">Promo Codes</Typography>
					<div>
						{user.hasScope("code:write") ? (
							<Button onClick={e => this.onAddCode("discount")} style={{ marginRight: 10 }}>New Discount Code</Button>
						) : null}

						{user.hasScope("code:write") ? (
							<Button onClick={e => this.onAddCode("access")}>New Access Code</Button>
						) : null}
					</div>

				</div>

				<Divider style={{ marginBottom: 40 }}/>

				{this.renderList()}
			</Container>
		);
	}
}

export default withStyles(styles)(CodeList);
