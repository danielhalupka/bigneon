import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import moment from "moment";

import Dialog from "../../../../../elements/Dialog";
import InputGroup from "../../../../../common/form/InputGroup";
import Bigneon from "../../../../../../helpers/bigneon";
import notification from "../../../../../../stores/notifications";
import AutoCompleteGroup from "../../../../../common/form/AutoCompleteGroup";
import Button from "../../../../../elements/Button";
import RadioButton from "../../../../../elements/form/RadioButton";
import DateTimePickerGroup from "../../../../../common/form/DateTimePickerGroup";

const formatHoldForSaving = values => {
	const { quantity, discountInCents, endAt, maxPerOrder } = values;
	return {
		...values,
		quantity: Number(quantity),
		discount_in_cents: discountInCents ? Number(discountInCents) : 0,
		end_at: moment.utc(endAt).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
		max_per_order: Number(maxPerOrder)
	};
};

const createHoldForInput = (values = {}) => {
	return {
		id: "",
		event_id: "",
		name: "",
		ticket_type_id: "",
		quantity: 0,
		redemption_code: "",
		hold_type: "Discount",
		discountInCents: 0,
		endAt: null,
		maxPerOrder: 0,
		...values
	};
};

const styles = {
	radioGroup: {
		display: "flex"
	}
};

export const HOLD_TYPES = {
	EDIT: "edit",
	NEW: "new",
	SPLIT: "split"
};

class HoldDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hold: createHoldForInput(),
			parentHold: createHoldForInput(),
			errors: {},
			isSubmitting: false
		};
	}

	componentWillMount(nextProps) {
		this.loadHold();
	}

	loadHold() {
		const { holdType, holdId, eventId } = this.props;

		if (holdId) {
			//Load the hold
			Bigneon()
				.holds.read({ id: holdId })
				.then(holdData => {
					let hold = holdData.data;
					if (holdType === HOLD_TYPES.SPLIT) {
						let { ...parentHold } = hold;
						hold.quantity = 0;
						this.setState({ parentHold, hold });
					} else {
						this.setState({ hold });
					}
				});
		} else {
			this.setState({
				hold: createHoldForInput({
					event_id: eventId,
					endAt: moment().add(1, "year")
				})
			});
		}
	}

	onSubmit() {
		const { hold } = this.state;
		const { holdType, onSuccess } = this.props;

		this.setState({ isSubmitting: true });
		let storeFunction;
		switch (holdType) {
			case HOLD_TYPES.NEW:
				storeFunction = Bigneon().events.holds.create;
				break;
			case HOLD_TYPES.EDIT:
				storeFunction = Bigneon().holds.update;
				break;
			case HOLD_TYPES.SPLIT:
				storeFunction = Bigneon().holds.split;
				break;
		}

		const formattedHold = formatHoldForSaving(hold);

		storeFunction(formattedHold)
			.then(response => {
				const { id } = response.data;
				this.setState({ isSubmitting: false });
				let message = `Successfully ${hold.id ? "updated" : "created"} hold`;
				notification.show({
					message,
					variant: "success"
				});
				onSuccess(id);
			})
			.catch(error => {
				this.setState({ isSubmitting: false });
				let message = `${hold.id ? "Update" : "Create"} hold failed.`;
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notification.show({
					message,
					variant: "error"
				});
			});
	}

	renderTicketTypesOrMaxPerOrder() {
		const { holdType, ticketTypes } = this.props;
		const { hold, errors } = this.state;

		if (holdType === HOLD_TYPES.SPLIT) {
			return (
				<Grid item xs={12}>
					<InputGroup
						error={errors.maxPerOrder}
						value={hold.maxPerOrder}
						name="maxPerOrder"
						label="Max Per Order"
						placeholder="1"
						type="text"
						onChange={e => {
							hold.maxPerOrder = e.target.value;
							this.setState({ hold });
						}}
					/>
				</Grid>
			);
		}

		const ticketTypeHash = {};
		ticketTypes.forEach(ticketType => {
			ticketTypeHash[ticketType.id] = ticketType.name;
		});

		let selectedTicketType;
		if (hold.ticket_type_id) {
			selectedTicketType = {
				value: hold.ticket_type_id,
				label: ticketTypeHash[hold.ticket_type_id] || ""
			};
		} else {
			selectedTicketType = "";
		}

		return (
			<AutoCompleteGroup
				value={selectedTicketType}
				items={ticketTypeHash}
				label={"Ticket Type"}
				name={"ticket-types"}
				onChange={(ticketTypeId, label) => {
					if (!ticketTypeId) {
						selectedTicketType = "";
						hold.ticket_type_id = "";
					} else {
						selectedTicketType = {};
						selectedTicketType.label = label;
						selectedTicketType.value = ticketTypeId;
						hold.ticket_type_id = ticketTypeId;
					}

					this.setState({ hold });
				}}
			/>
		);
	}

	renderQuantities() {
		const { holdType } = this.props;
		const { hold, errors, parentHold } = this.state;

		if (holdType === HOLD_TYPES.SPLIT) {
			let totalHeld = parentHold.quantity - hold.quantity;

			return (
				<Grid container spacing={16}>
					<Grid item xs={6}>
						<InputGroup
							value={totalHeld}
							name="total_held"
							label="Total Held"
							placeholder="100"
							type="text"
							disabled={true}
							onChange={e => {}}
						/>
					</Grid>
					<Grid item xs={6}>
						<InputGroup
							error={errors.quantity}
							value={hold.quantity}
							name="quantity"
							label="Total to Split to New Code"
							placeholder="10"
							type="text"
							onChange={e => {
								hold.quantity = +e.target.value;
								this.setState({ hold });
							}}
						/>
					</Grid>
				</Grid>
			);
		}

		return (
			<Grid container spacing={16}>
				<Grid item xs={6}>
					<InputGroup
						error={errors.quantity}
						value={hold.quantity}
						name="quantity"
						label="Total Held"
						placeholder="100"
						type="number"
						onChange={e => {
							hold.quantity = e.target.value;
							this.setState({ hold });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
				</Grid>
				<Grid item xs={6}>
					<InputGroup
						error={errors.maxPerOrder}
						value={hold.maxPerOrder}
						name="maxPerOrder"
						label="Max Per Order"
						placeholder="1"
						type="number"
						onChange={e => {
							hold.maxPerOrder = e.target.value;
							this.setState({ hold });
						}}
					/>
				</Grid>
			</Grid>
		);
	}

	render() {
		const {
			holdType = HOLD_TYPES.NEW,
			onClose,
			classes,
			holdId,
			ticketTypes,
			eventId,
			onSuccess,
			...other
		} = this.props;
		const { isSubmitting } = this.state;

		let iconUrl = "/icons/tickets-white.svg";
		let title = "Create";
		let nameField = "Name (For Reports)";
		let saveButtonText = "Create";
		switch (holdType) {
			case HOLD_TYPES.SPLIT:
				nameField = "New Hold Name (For Reports)";
				iconUrl = "/icons/split-white.svg";
				title = "Split";
				saveButtonText = "Split";
				break;
			case HOLD_TYPES.NEW:
				title = "Create";
				break;
			case HOLD_TYPES.EDIT:
				title = "Update";
				saveButtonText = "Update";
				break;
		}

		const { hold, errors } = this.state;

		return (
			<Dialog
				onClose={onClose}
				iconUrl={iconUrl}
				title={`${title} hold`}
				{...other}
			>
				<div>
					<InputGroup
						error={errors.name}
						value={hold.name}
						name="name"
						label={nameField}
						placeholder="- Please enter hold name"
						autofocus={true}
						type="text"
						onChange={e => {
							hold.name = e.target.value;
							this.setState({ hold });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
					<InputGroup
						error={errors.redemption_code}
						value={hold.redemption_code}
						name="redemption_code"
						label="Redemption Code"
						placeholder="- Please enter code (min 6 chars)"
						type="text"
						onChange={e => {
							hold.redemption_code = e.target.value.toUpperCase();
							this.setState({ hold });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>

					{this.renderTicketTypesOrMaxPerOrder()}
					<Grid container spacing={16}>
						<Grid item xs={12}>
							<div className={classes.radioGroup}>
								<RadioButton
									active={hold.hold_type === "Discount"}
									onClick={() => {
										this.setState({
											hold: {
												...hold,
												hold_type: "Discount",
												discountInCents: hold.discountInCents
											}
										});
									}}
								>
									Discount
								</RadioButton>

								<RadioButton
									active={hold.hold_type === "Comp"}
									onClick={() => {
										this.setState({
											hold: {
												...hold,
												hold_type: "Comp",
												discountInCents: 0
											}
										});
									}}
								>
									Comp
								</RadioButton>
							</div>
						</Grid>
						<Grid item xs={6}>
							<InputGroup
								error={errors.discountInCents}
								value={hold.discountInCents}
								name="discountInCents"
								label="Discount"
								placeholder="0"
								type="number"
								disabled={hold.hold_type === "Comp"}
								onChange={e => {
									hold.discountInCents = e.target.value;
									this.setState({ hold });
								}}
								// onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={6}>
							<DateTimePickerGroup
								error={errors.endAt}
								value={hold.endAt}
								name="endAt"
								placeholder="Never"
								label="Auto Release Date"
								onChange={endAt => {
									hold.endAt = endAt;
									this.setState({ hold });
								}}
								// onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
					</Grid>
					{this.renderQuantities()}

					<div style={{ display: "flex" }}>
						<Button
							size="large"
							style={{ marginRight: 10, flex: 1 }}
							onClick={onClose}
							color="primary"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							size="large"
							style={{ marginLeft: 10, flex: 1 }}
							type="submit"
							variant="callToAction"
							onClick={this.onSubmit.bind(this)}
							disabled={isSubmitting}
						>
							{saveButtonText}
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}
}

HoldDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	holdType: PropTypes.string,
	holdId: PropTypes.string,
	eventId: PropTypes.string,
	ticketTypes: PropTypes.array,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(HoldDialog);
