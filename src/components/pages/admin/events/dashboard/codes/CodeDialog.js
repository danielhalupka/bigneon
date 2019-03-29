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
import SelectGroup from "../../../../../common/form/SelectGroup";
import notifications from "../../../../../../stores/notifications";

const formatCodeForSaving = values => {
	const {
		quantity,
		discount_in_cents,
		discountInDollars,
		maxTicketsPerUser,
		event_id,
		id,
		redemption_codes,
		ticket_type_id,
		name,
		start_date,
		end_date,
		...rest
	} = values;

	const result = {
		//id,
		name,
		code_type: "Discount",
		max_uses: Number(quantity),
		discount_in_cents: discountInDollars
			? Number(discountInDollars) * 100
			: discount_in_cents,
		start_date: moment
			.utc(start_date)
			.format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
		end_date: moment.utc(end_date).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),

		max_tickets_per_user: Number(maxTicketsPerUser),
		event_id,
		redemption_codes,
		ticket_type_ids: [ticket_type_id]
	};

	return result;
};

const createCodeForInput = (values = {}) => {
	const {
		discount_in_cents,
		max_tickets_per_user,
		end_date,
		start_date
	} = values;
	return {
		id: "",
		event_id: "",
		name: "",
		ticket_type_id: "",
		quantity: 0,
		redemption_codes: [""],
		discountInDollars: discount_in_cents
			? (discount_in_cents / 100).toFixed(2)
			: "",
		maxTicketsPerUser: max_tickets_per_user || "",
		startDate: start_date
			? moment.utc(start_date, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
			: null,
		endDate: end_date
			? moment.utc(end_date, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
			: null,
		// endAtTimeKey: end_at ? "custom" : "never", //TODO get the correct value based on the current event's dates
		// endAt: end_at
		// 	? moment.utc(end_at, moment.HTML5_FMT.DATETIME_LOCAL_MS).local()
		// 	: null,
		...values
	};
};

const startAtTimeOptions = [
	{
		value: "event_start_time",
		label: "Event start time",
		startAtDateString: ({ event_start }, date) => {
			return event_start;
		}
	}
];

const endAtTimeOptions = [
	{
		value: "never",
		label: "Never",
		endAtDateString: (event, endAt) => {
			return null;
		}
	},
	{
		value: "event_start_time",
		label: "Event start time",
		endAtDateString: ({ event_start }, endAt) => {
			return event_start;
		}
	},
	{
		value: "event_door_time",
		label: "Event Door time",
		endAtDateString: ({ door_time }, endAt) => {
			return door_time;
		}
	},
	{
		value: "day_of_event",
		label: "Day of the Event (8am)",
		endAtDateString: ({ event_start }, endAt) => {
			if (!event_start) {
				return null;
			}

			const eventDate = moment
				.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				.local();

			eventDate.set({
				hour: 8,
				minute: 0,
				second: 0
			});

			return moment.utc(eventDate).format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		}
	},
	{
		value: "one_day_before",
		label: "1 Day Before the Event (8am)",
		endAtDateString: ({ event_start }, endAt) => {
			if (!event_start) {
				return null;
			}

			const eventDate = moment
				.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS)
				.local();

			eventDate.subtract(1, "d").set({
				hour: 8,
				minute: 0,
				second: 0
			});

			return moment.utc(eventDate).format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		}
	},
	{
		value: "custom",
		label: "Custom",
		endAtDateString: (event, endAt) => {
			if (!endAt) {
				return null;
			}

			return moment.utc(endAt).format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		}
	}
];

const styles = {
	radioGroup: {
		display: "flex"
	}
};

export const CODE_TYPES = {
	EDIT: "edit",
	NEW: "new"
};

class CodeDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			code: createCodeForInput(),
			errors: {},
			isSubmitting: false,
			totalAvailablePerTicketType: {} // {ticketTypeId: count}
		};
	}

	componentWillMount(nextProps) {
		this.loadCode();
	}

	loadCode() {
		const { codeId, eventId, ticketTypes } = this.props;

		if (codeId) {
			Bigneon()
				.codes.read({ id: codeId })
				.then(response => {
					const code = response.data;
					this.setState({ code: createCodeForInput(code) });
				});
		} else {
			this.setState({
				code: createCodeForInput({
					event_id: eventId,
					endAt: null //moment().add(1, "year")
				})
			});
		}
	}

	onSubmit() {
		const { code } = this.state;
		const { codeType, onSuccess, eventId } = this.props;

		this.setState({ isSubmitting: true });
		let storeFunction;
		switch (codeType) {
			case CODE_TYPES.NEW:
				storeFunction = Bigneon().events.codes.create;
				break;
			case CODE_TYPES.EDIT:
				storeFunction = Bigneon().code.update;
				break;
		}

		//Get the calculated end_date using the event dates
		const { endAtTimeKey, endDate, startDate } = code;
		// const endAtOption = endAtTimeOptions.find(
		// 	option => option.value === endAtTimeKey
		// );
		Bigneon()
			.events.read({ id: eventId })
			.then(response => {
				const event = response.data;
				//const end_date = endAtOption.endAtDateString(event, endAt);

				const end_date = endDate;
				const start_date = startDate;
				const formattedCode = formatCodeForSaving({
					...code,
					end_date,
					start_date
				});

				storeFunction(formattedCode)
					.then(response => {
						const { id } = response.data;
						this.setState({ isSubmitting: false });
						const message = `Successfully ${
							code.id ? "updated" : "created"
						} code`;
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
							defaultMessage: `${code.id ? "Update" : "Create"} code failed.`
						});
					});
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	renderTicketTypesOrMaxTicketsPerUser() {
		const { codeType, ticketTypes } = this.props;

		const { code, errors } = this.state;

		const ticketTypeHash = {};
		ticketTypes.forEach(ticketType => {
			ticketTypeHash[ticketType.id] = ticketType.name;
		});

		let selectedTicketType;
		if (code.ticket_type_id) {
			selectedTicketType = {
				value: code.ticket_type_id,
				label: ticketTypeHash[code.ticket_type_id] || ""
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
						code.ticket_type_id = "";
					} else {
						selectedTicketType = {};
						selectedTicketType.label = label;
						selectedTicketType.value = ticketTypeId;
						code.ticket_type_id = ticketTypeId;
					}

					this.setState({ code });
				}}
			/>
		);
	}

	renderQuantities() {
		const { codeType } = this.props;
		const { code, errors, totalAvailablePerTicketType } = this.state;

		const { ticket_type_id } = code;
		const totalAvailable =
			ticket_type_id && totalAvailablePerTicketType[ticket_type_id]
				? totalAvailablePerTicketType[ticket_type_id]
				: null;

		return (
			<Grid container spacing={16}>
				<Grid item xs={12} md={6} lg={6}>
					<InputGroup
						error={errors.quantity}
						value={code.quantity}
						name="quantity"
						label="Uses*"
						placeholder="100"
						type="number"
						onChange={e => {
							code.quantity = e.target.value;
							this.setState({ code });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
				</Grid>
				<Grid item xs={12} md={6} lg={6}>
					<InputGroup
						error={errors.maxTicketsPerUser}
						value={code.maxTicketsPerUser}
						name="maxTicketsPerUser"
						label="Max Per Order"
						placeholder="1-"
						type="number"
						onChange={e => {
							code.maxTicketsPerUser = e.target.value;
							this.setState({ code });
						}}
					/>
				</Grid>
			</Grid>
		);
	}

	renderStartAtTimeOptions() {
		const { code } = this.state;

		return (
			<SelectGroup
				value={code.startAtTimeKey || "never"}
				items={startAtTimeOptions}
				name={"startAtTimeOptions"}
				label={"Starts"}
				onChange={e => {
					code.startAtTimeKey = e.target.value;
					this.setState({ code });
				}}
			/>
		);
	}

	renderEndAtTimeOptions() {
		const { code } = this.state;

		return (
			<SelectGroup
				value={code.endAtTimeKey || "never"}
				items={endAtTimeOptions}
				name={"endAtTimeOptions"}
				label={"Ends"}
				onChange={e => {
					code.endAtTimeKey = e.target.value;
					this.setState({ code });
				}}
			/>
		);
	}

	renderCustomStartAtDates() {
		const { code, errors } = this.state;

		// if (!code.startAtTimeKey || code.startAtTimeKey !== "custom") {
		// 	return null;
		// }

		const { startDate } = code;

		return (
			<Grid container spacing={16}>
				<Grid item xs={12} md={6} lg={6}>
					<DateTimePickerGroup
						type={"date"}
						error={errors.startDate}
						value={code.startDate}
						name="startAtDate"
						label="Starts"
						onChange={newStartAtDate => {
							if (startDate) {
								//Take the time from current date
								newStartAtDate.set({
									hour: startDate.get("hour"),
									minute: startDate.get("minute"),
									second: startDate.get("second")
								});
							} else {
								newStartAtDate.set({
									hour: 12,
									minute: 0,
									second: 0
								});
							}

							code.startDate = newStartAtDate;

							this.setState({ code });
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6} lg={6}>
					<DateTimePickerGroup
						type={"time"}
						error={errors.startDate}
						value={code.startDate}
						name="startAtTime"
						label="at"
						onChange={newStartAtTime => {
							if (startDate) {
								startDate.set({
									hour: newStartAtTime.get("hour"),
									minute: newStartAtTime.get("minute"),
									second: newStartAtTime.get("second")
								});

								code.startDate = startDate;
							} else {
								code.startDate = newStartAtTime;
							}

							this.setState({ code });
						}}
					/>
				</Grid>
			</Grid>
		);
	}

	renderCustomEndAtDates() {
		const { code, errors } = this.state;

		const { endDate } = code;

		return (
			<Grid container spacing={16}>
				<Grid item xs={12} md={6} lg={6}>
					<DateTimePickerGroup
						type={"date"}
						error={errors.endDate}
						value={code.endDate}
						name="endAtDate"
						label="Ends (custom)"
						onChange={newEndAtDate => {
							if (endDate) {
								//Take the time from current date
								newEndAtDate.set({
									hour: endDate.get("hour"),
									minute: endDate.get("minute"),
									second: endDate.get("second")
								});
							} else {
								newEndAtDate.set({
									hour: 12,
									minute: 0,
									second: 0
								});
							}

							code.endDate = newEndAtDate;

							this.setState({ code });
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6} lg={6}>
					<DateTimePickerGroup
						type={"time"}
						error={errors.endAt}
						value={code.endAt}
						name="endAtTime"
						label="at"
						onChange={newEndAtTime => {
							if (endDate) {
								endDate.set({
									hour: newEndAtTime.get("hour"),
									minute: newEndAtTime.get("minute"),
									second: newEndAtTime.get("second")
								});

								code.endDate = endDate;
							} else {
								code.endDate = newEndAtTime;
							}

							this.setState({ code });
						}}
					/>
				</Grid>
			</Grid>
		);
	}

	render() {
		const {
			codeType = CODE_TYPES.NEW,
			onClose,
			classes,
			codeId,
			ticketTypes,
			eventId,
			onSuccess,
			...other
		} = this.props;
		const { isSubmitting } = this.state;

		const iconUrl = "/icons/tickets-white.svg";
		let title = "Create";
		const nameField = "Name (For Reports)";
		let saveButtonText = "Create";
		switch (codeType) {
			case CODE_TYPES.NEW:
				title = "Create";
				break;
			case CODE_TYPES.EDIT:
				title = "Update";
				saveButtonText = "Update";
				break;
		}

		const { code, errors } = this.state;
		return (
			<Dialog
				onClose={onClose}
				iconUrl={iconUrl}
				title={`${title} code`}
				{...other}
			>
				<div>
					<InputGroup
						error={errors.name}
						value={code.name}
						name="name"
						label={nameField}
						placeholder="- Please enter code name"
						autofocus={true}
						type="text"
						onChange={e => {
							code.name = e.target.value;
							this.setState({ code });
						}}
					/>
					<InputGroup
						error={errors.redemption_codes}
						value={code.redemption_codes[0]}
						name="redemption_code"
						label="Codes"
						placeholder="- Please enter code (min 6 chars)"
						type="text"
						onChange={e => {
							code.redemption_codes = [e.target.value.toUpperCase()];
							this.setState({ code });
						}}
					/>

					{this.renderTicketTypesOrMaxTicketsPerUser()}
					<Grid container spacing={16}>
						<Grid item xs={12} md={6} lg={6}>
							<InputGroup
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									)
								}}
								error={errors.discountInDollars}
								value={code.discountInDollars}
								name="discountInDollars"
								label="Discount"
								placeholder=""
								type="number"
								onChange={e => {
									code.discountInDollars = e.target.value;
									this.setState({ code });
								}}
							/>
						</Grid>
						<Grid item xs={12} md={6} lg={6}>
							Discount perc
						</Grid>
					</Grid>
					{/* <Grid container spacing={16}>
						<Grid item xs={12} md={6} lg={6}>
							{this.renderStartAtTimeOptions()}
						</Grid>
						<Grid item xs={12} md={6} lg={6}>
							{this.renderEndAtTimeOptions()}
						</Grid>
					</Grid>
					 */}

					{this.renderCustomStartAtDates()}
					{this.renderCustomEndAtDates()}

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

CodeDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	codeType: PropTypes.string,
	codeId: PropTypes.string,
	eventId: PropTypes.string.isRequired,
	ticketTypes: PropTypes.array,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(CodeDialog);
