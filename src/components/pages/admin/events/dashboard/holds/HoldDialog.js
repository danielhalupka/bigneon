import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import moment from "moment";

import Dialog from "../../../../../elements/Dialog";
import InputGroup from "../../../../../common/form/InputGroup";
import Bigneon from "../../../../../../helpers/bigneon";
import notification from "../../../../../../stores/notifications";
import AutoCompleteGroup from "../../../../../common/form/AutoCompleteGroup";
import Button from "../../../../../elements/Button";
import RadioButton from "../../../../../elements/form/RadioButton";
import DateTimePickerGroup from "../../../../../common/form/DateTimePickerGroup";
import eventUpdateStore from "../../../../../../stores/eventUpdate";
import SelectGroup from "../../../../../common/form/SelectGroup";

const formatHoldForSaving = values => {
	const {
		quantity,
		discount_in_cents,
		discountInDollars,
		endAt,
		maxPerOrder,
		event_id,
		hold_type,
		id,
		redemption_code,
		ticket_type_id,
		name,
		parent_hold_id,
		...rest
	} = values;

	const result = {
		id,
		name,
		quantity: Number(quantity),
		discount_in_cents: discountInDollars
			? Number(discountInDollars) * 100
			: discount_in_cents,
		end_at: endAt
			? moment.utc(endAt).format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
			: undefined,
		max_per_order: Number(maxPerOrder),
		event_id,
		redemption_code,
		ticket_type_id,
		hold_type,
		parent_hold_id
	};

	return result;
};

const createHoldForInput = (values = {}) => {
	const { discount_in_cents, max_per_order } = values;
	return {
		id: "",
		event_id: "",
		name: "",
		ticket_type_id: "",
		quantity: 0,
		redemption_code: "",
		hold_type: "Discount",
		discountInDollars: discount_in_cents
			? (discount_in_cents / 100).toFixed(2)
			: "",
		endAt: null,
		maxPerOrder: max_per_order || "",
		...values
	};
};

export const HOLD_TYPES = {
	EDIT: "edit",
	NEW: "new",
	SPLIT: "split"
};

const releaseTimeOptions = [
	{
		value: "never",
		label: "Never",
		getReleaseDate: (event) => {
			//TODO use event date to return release_date
		} },
	{ value: "event_start_time", label: "Event start time" },
	{ value: "event_door_time", label: "Event Door time" },
	{ value: "day_of_event", label: "Day of the Event (8am)" },
	{ value: "one_day_before", label: "1 Day Before the Event (8am)" },
	{ value: "custom", label: "Custom" }
];

const styles = {
	radioGroup: {
		display: "flex"
	}
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
					const hold = holdData.data;
					if (holdType === HOLD_TYPES.SPLIT) {
						const { ...parentHold } = hold;
						hold.quantity = 0;
						this.setState({
							parentHold: createHoldForInput(parentHold),
							hold: createHoldForInput(hold)
						});
					} else {
						this.setState({ hold: createHoldForInput(hold) });
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
				const message = `Successfully ${hold.id ? "updated" : "created"} hold`;
				notification.show({
					message,
					variant: "success"
				});
				onSuccess(id);
			})
			.catch(error => {
				this.setState({ isSubmitting: false });
				console.error(error);
				notification.showFromErrorResponse({
					error,
					defaultMessage: `${hold.id ? "Update" : "Create"} hold failed.`
				});
			});
	}

	renderTicketTypesOrMaxPerOrder() {
		const { holdType, ticketTypes } = this.props;
		const { hold, errors } = this.state;

		if (holdType === HOLD_TYPES.SPLIT) {
			return (
				<Grid item xs={12} md={6} lg={6}>
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
			const totalHeld = parentHold.quantity - hold.quantity;

			return (
				<Grid container spacing={16}>
					<Grid item xs={12} md={6} lg={6}>
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
					<Grid item xs={12} md={6} lg={6}>
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
				<Grid item xs={12} md={6} lg={6}>
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
				<Grid item xs={12} md={6} lg={6}>
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

	renderReleaseTimeOptions() {
		const { hold } = this.state;

		return (
			<SelectGroup
				value={hold.releaseTimeKey || "never"}
				items={releaseTimeOptions}
				name={"releaseTimeOptions"}
				label={"Release time"}
				onChange={e => {
					const releaseTimeKey = e.target.value;
				}}
			/>
		);
	}

	// renderCustomReleaseDates() {
	// 	const { hold, errors } = this.state;
	//
	// 	if (!hold.releaseTimeKey || hold.releaseTimeKey !== "custom") {
	// 		return null;
	// 	}
	// 	//TODO only display if custom date
	//
	// 	return (
	// 		<Grid container spacing={16}>
	// 			<DateTimePickerGroup
	// 				type={"date"}
	// 				error={errors.endAt}
	// 				value={hold.endAt}
	// 				name="endAt"
	// 				placeholder="Never"
	// 				label="Auto Release Date"
	// 				onChange={endAt => {
	// 					hold.endAt = endAt;
	// 					this.setState({ hold });
	// 				}}
	// 				// onBlur={this.validateFields.bind(this)}
	// 			/>
	// 		</Grid>
	// 	);
	// }

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
						<Grid item xs={12} md={12} lg={12}>
							<div className={classes.radioGroup}>
								<RadioButton
									active={hold.hold_type === "Discount"}
									onClick={() => {
										this.setState({
											hold: {
												...hold,
												hold_type: "Discount",
												discountInDollars: hold.discountInDollars
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
												discountInDollars: ""
											}
										});
									}}
								>
									Comp
								</RadioButton>
							</div>
						</Grid>
						<Grid item xs={12} md={6} lg={6}>
							<InputGroup
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									)
								}}
								error={errors.discountInDollars}
								value={hold.discountInDollars}
								name="discountInDollars"
								label="Discount"
								placeholder=""
								type="number"
								disabled={hold.hold_type === "Comp"}
								onChange={e => {
									hold.discountInDollars = e.target.value;
									this.setState({ hold });
								}}
								// onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						{/*<Grid item xs={12} md={6} lg={6}>*/}
						{/*{this.renderReleaseTimeOptions()}*/}
						{/*</Grid>*/}
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
