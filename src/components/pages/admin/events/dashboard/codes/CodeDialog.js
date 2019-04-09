import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import moment from "moment-timezone";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input/Input";

import Dialog from "../../../../../elements/Dialog";
import InputGroup from "../../../../../common/form/InputGroup";
import Bigneon from "../../../../../../helpers/bigneon";
import notification from "../../../../../../stores/notifications";

import Button from "../../../../../elements/Button";
import RadioButton from "../../../../../elements/form/RadioButton";
import DateTimePickerGroup from "../../../../../common/form/DateTimePickerGroup";
import SelectGroup from "../../../../../common/form/SelectGroup";
import notifications from "../../../../../../stores/notifications";
import { FormHelperText } from "@material-ui/core";
import Loader from "../../../../../elements/loaders/Loader";

const formatCodeForSaving = values => {
	const {
		maxUses,
		discount_type,
		discount_in_cents,
		discountInDollars,
		discountAsPercentage,
		maxTicketsPerUser,
		event_id,
		id,
		redemption_codes,
		ticket_type_ids,
		name,
		start_date,
		end_date,
		codeType,
		code_type,
		...rest
	} = values;

	let discount;
	if (discount_type === "Absolute") {
		discount = {
			discount_in_cents: discountInDollars
				? Number(discountInDollars) * 100
				: discount_in_cents
		};
	} else {
		discount = {
			discount_as_percentage: Number(discountAsPercentage)
		};
	}

	let db_code_type;
	if (codeType === CODE_TYPES.NEW_ACCESS || (code_type && code_type === "Access")) {
		discount = { discount_in_cents: 0 };
		db_code_type = "Access";
	} else {
		db_code_type = "Discount";
	}

	const result = {
		id,
		name,
		code_type: db_code_type,
		max_uses: Number(maxUses),
		start_date: start_date,
		end_date: end_date,
		event_id,
		redemption_codes,
		ticket_type_ids: ticket_type_ids,
		max_tickets_per_user: Number(maxTicketsPerUser) ? Number(maxTicketsPerUser) : null,
		...discount
	};
	return result;
};

const createCodeForInput = (values = {}, timezone) => {
	const {
		discount_in_cents,
		discount_as_percentage,
		max_uses,
		max_tickets_per_user,
		end_date,
		start_date,
		ticket_type_ids,
		event_start,
		code_type
	} = values;

	return {
		id: "",
		event_id: "",
		name: "",
		ticket_type_id:
			ticket_type_ids && ticket_type_ids.length > 0 ? ticket_type_ids[0] : "",
		maxUses: max_uses || "",
		redemption_codes: [""],
		discount_type: discount_as_percentage
			? "Percentage"
			: "Absolute",
		discountInDollars: discount_in_cents
			? (discount_in_cents / 100).toFixed(2)
			: "",
		discountAsPercentage: discount_as_percentage
			? discount_as_percentage
			: "",
		maxTicketsPerUser: max_tickets_per_user || "",
		startDate: start_date
			? moment.utc(start_date, moment.HTML5_FMT.DATETIME_LOCAL_MS).tz(timezone)
			: moment.utc().tz(timezone),
		startAtTimeKey: start_date ? "custom" : "now",
		endDate: end_date
			? moment.utc(end_date, moment.HTML5_FMT.DATETIME_LOCAL_MS).tz(timezone)
			: moment.utc(event_start, moment.HTML5_FMT.DATETIME_LOCAL_MS).tz(timezone),
		endAtTimeKey: end_date ? "custom" : "never",
		...values
	};
};

const startAtTimeOptions = [
	{
		value: "now",
		label: "Now",
		startAtDateString: (startDate) => {
			return null;
		}
	},
	{
		value: "custom",
		label: "Custom",
		startAtDateString: (startDate) => {
			if (!startDate) {
				return null;
			}

			return moment
				.utc(startDate)
				.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		}
	}
];

const endAtTimeOptions = [
	{
		value: "never",
		label: "Never",
		endAtDateString: (endAt) => {
			return null;
		}
	},
	{
		value: "custom",
		label: "Custom",
		endAtDateString: (endAt) => {
			if (!endAt) {
				return null;
			}

			return moment.utc(endAt).format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
		}
	}
];

const styles = theme => ({
	radioGroup: {
		display: "flex",
		marginTop: theme.spacing.unit * 2
	}
});

export const CODE_TYPES = {
	NEW_ACCESS: "new_access",
	NEW_DISCOUNT: "new_discount",
	EDIT_DISCOUNT: "edit_discount",
	EDIT_ACCESS: "edit_access"
};

class CodeDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			code: null,
			errors: {},
			isSubmitting: false,
			timezone: null,
			totalAvailablePerTicketType: {} // {ticketTypeId: count}
		};
	}

	componentDidMount() {
		this.loadCode();
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const errors = {};

		//TODO
		const { code } = this.state;
		const { startDate, ticket_type_ids, discount_type, discountAsPercentage } = code;

		if (!startDate) {
			errors.startDate = "Missing start date.";
		}

		if (discount_type !== "Absolute") {
			const percent = Number(discountAsPercentage);
			if (percent < 0 || percent > 100) {
				errors.discountAsPercentage = "Invalid percent.";
			}
		}

		if (!ticket_type_ids || typeof ticket_type_ids !== "object" || ticket_type_ids[0] === "") {
			errors.ticket_type_ids = "Missing ticket types.";
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	loadCode() {
		const { codeId, eventId, ticketTypes } = this.props;

		Bigneon()
			.events.read({ id: eventId })
			.then(response => {
				const { event_start, venue } = response.data;
				const { timezone } = venue;

				this.setState({ timezone },  () => {
					if (codeId) {
						Bigneon()
							.codes.read({ id: codeId })
							.then(response => {
								const code = response.data;
								this.setState( { code: createCodeForInput({ event_start: event_start, ...code }, timezone) } );
							}).catch(error => {
								notification.showFromErrorResponse({
									defaultMessage: "Failed to load code.",
									error
								});
							});
					} else {
						this.setState({
							code: createCodeForInput({
								event_id: eventId,
								event_start: event_start
							}, timezone)
						});
					}
				});
			}).catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});
	}

	onSubmit() {
		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		const { code } = this.state;
		const { codeType, onSuccess, eventId } = this.props;

		this.setState({ isSubmitting: true });
		let storeFunction;
		switch (codeType) {
			case CODE_TYPES.NEW_ACCESS:
			case CODE_TYPES.NEW_DISCOUNT :
				storeFunction = Bigneon().events.codes.create;
				break;
			case CODE_TYPES.EDIT_ACCESS:
			case CODE_TYPES.EDIT_DISCOUNT:
				storeFunction = Bigneon().codes.update;
				break;
		}

		//Get the calculated end_date using the event dates
		const { endAtTimeKey, startAtTimeKey, endDate, startDate, code_type } = code;
		const endAtOption = endAtTimeOptions.find(option => option.value === endAtTimeKey);
		const startAtOption = startAtTimeOptions.find(option => option.value === startAtTimeKey);
		const end_date = endAtOption.endAtDateString(endDate);
		const start_date = startAtOption.startAtDateString(startDate);

		const formattedCode = formatCodeForSaving({
			...code,
			end_date,
			start_date,
			codeType,
			code_type
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

	}

	renderTicketTypes() {
		const { codeType, ticketTypes } = this.props;
		const { code, errors } = this.state;

		const ticketTypeHash = {};
		ticketTypes.forEach(ticketType => {
			ticketTypeHash[ticketType.id] = ticketType.name;
		});

		let selectedTicketType;
		if (code.ticket_type_ids) {
			selectedTicketType = code.ticket_type_ids || [""];
		} else {
			selectedTicketType = [""];
		}

		let items = <MenuItem disabled>{"No ticket types found"}</MenuItem>;
		if (ticketTypes.length > 0) {
			items = Object.keys(ticketTypeHash).map(key => (
				<MenuItem key={key} value={key}>
					{ticketTypeHash[key]}
				</MenuItem>
			));
		}

		return (
			<FormControl style={{ width: "100%" }} error={!!errors.ticket_type_ids}>
				<InputLabel shrink htmlFor="ticket-types-label-placeholder">
					Select Ticket Types*
				</InputLabel>
				<Select
					onBlur={this.validateFields.bind(this)}
					error={!!errors.ticket_type_ids}
					multiple
					value={selectedTicketType}
					onChange={e => {
						code.ticket_type_ids = e.target.value;
						code.ticket_type_ids = code.ticket_type_ids.filter(id => {
							return id !== "";
						});
						this.setState({ code });
					}}
					input={<Input id="select-multiple-ticket-types"/>}
					name="ticket-types"
					displayEmpty
				>
					{items}
				</Select>
				<FormHelperText id={`${name}-error-text`}>{errors.ticket_type_ids}</FormHelperText>
			</FormControl>
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
						error={errors.maxUses}
						value={code.maxUses}
						name="maxUses"
						label="Total Uses*"
						placeholder="Unlimited"
						type="number"
						onChange={e => {
							code.maxUses = e.target.value;
							this.setState({ code });
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6} lg={6}>
					<InputGroup
						error={errors.maxTicketsPerUser}
						value={code.maxTicketsPerUser}
						name="maxTicketsPerUser"
						label="Limit per customer"
						placeholder="Unlimited"
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

	renderDiscounts(codeType, classes) {
		const { code, errors } = this.state;
		if (codeType === CODE_TYPES.NEW_DISCOUNT || codeType === CODE_TYPES.EDIT_DISCOUNT) {
			return (
				<Grid container>
					<Grid item xs={12} md={12} lg={12}>
						<div className={classes.radioGroup}>
							<RadioButton
								active={code.discount_type === "Absolute"}
								onClick={() => {
									this.setState({
										code: {
											...code,
											discount_type: "Absolute",
											discountInDollars: code.discountInDollars
										}
									});
								}}
							>
								Discount in dollars
							</RadioButton>

							<RadioButton
								active={code.discount_type === "Percentage"}
								onClick={() => {
									this.setState({
										code: {
											...code,
											discount_type: "Percentage",
											discountAsPercentage: code.discountAsPercentage
										}
									});
								}}
							>
								Discount as percentage
							</RadioButton>
						</div>
					</Grid>
					<Grid container spacing={16}>
						<Grid item xs={12} md={6} lg={6}>
							{this.renderDiscountInput()}
						</Grid>
						<Grid item xs={12} md={6} lg={6}/>
					</Grid>
				</Grid>
			);
		}
	}

	renderDiscountInput() {
		const { code, errors } = this.state;
		if (code.discount_type === "Absolute") {
			return (
				<InputGroup
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">$</InputAdornment>
						)
					}}
					error={errors.discountInDollars}
					value={code.discountInDollars}
					name={"discountInDollars"}
					placeholder=""
					type="number"
					onChange={e => {
						code.discountInDollars = e.target.value;
						this.setState({ code });
					}}
				/>
			);
		} else {
			return (
				<InputGroup
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">%</InputAdornment>
						)
					}}
					error={errors.discountAsPercentage}
					value={code.discountAsPercentage}
					name={"discountAsPercentage"}
					placeholder=""
					type="number"
					onChange={e => {
						code.discountAsPercentage = e.target.value;
						this.setState({ code });
					}}
				/>
			);
		}
	}

	renderStartAtTimeOptions(codeType) {
		if (codeType === CODE_TYPES.NEW_DISCOUNT || codeType === CODE_TYPES.EDIT_DISCOUNT) {
			const { code } = this.state;

			return (
				<SelectGroup
					value={code.startAtTimeKey || "now"}
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
	}

	renderEndAtTimeOptions(codeType) {
		if (codeType === CODE_TYPES.NEW_DISCOUNT || codeType === CODE_TYPES.EDIT_DISCOUNT) {
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
	}

	renderCustomStartAtDates(codeType) {
		if (codeType === CODE_TYPES.NEW_DISCOUNT || codeType === CODE_TYPES.EDIT_DISCOUNT) {
			const { code, errors } = this.state;

			if (!code.startAtTimeKey || code.startAtTimeKey !== "custom") {
				return null;
			}

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
	}

	renderCustomEndAtDates(codeType) {
		if (codeType === CODE_TYPES.NEW_DISCOUNT || codeType === CODE_TYPES.EDIT_DISCOUNT) {
			const { code, errors } = this.state;

			const { endDate } = code;
			if (!code.endAtTimeKey || code.endAtTimeKey !== "custom") {
				return null;
			}

			if (!code.endAtTimeKey || code.endAtTimeKey !== "custom") {
				return null;
			}

			return (
				<Grid container spacing={16}>
					<Grid item xs={12} md={6} lg={6}>
						<DateTimePickerGroup
							type={"date"}
							error={errors.endDate}
							value={code.endDate}
							name="endAtDate"
							label="Ends"
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
							error={errors.endDate}
							value={code.endDate}
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
	}

	render() {
		const {
			codeType = CODE_TYPES.NEW_DISCOUNT,
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
		const nameField = "Name (For Reports)*";
		let saveButtonText = "Create";
		switch (codeType) {
			case CODE_TYPES.NEW_ACCESS:
				title = "New Access Code";
				break;
			case CODE_TYPES.NEW_DISCOUNT:
				title = "New Discount Code";
				break;
			case CODE_TYPES.EDIT_DISCOUNT:
				title = "Update Discount Code";
				saveButtonText = "Update";
				break;
			case CODE_TYPES.EDIT_ACCESS:
				title = "Update Access Code";
				saveButtonText = "Update";
				break;
		}

		const { code, errors } = this.state;

		const content =  code ? (
			<div>
				<InputGroup
					error={errors.name}
					value={code.name}
					name="name"
					label={nameField}
					placeholder="Please name this promo code"
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
					label="Promo Code*"
					placeholder="Please enter code (min 6 chars)"
					type="text"
					onChange={e => {
						code.redemption_codes = [e.target.value.toUpperCase()];
						this.setState({ code });
					}}
				/>

				{this.renderTicketTypes()}

				{this.renderDiscounts(codeType, classes)}

				{this.renderStartAtTimeOptions(codeType)}
				{this.renderCustomStartAtDates(codeType)}

				{this.renderEndAtTimeOptions(codeType)}
				{this.renderCustomEndAtDates(codeType)}

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
		) : <Loader/>;

		return (
			<Dialog
				onClose={onClose}
				iconUrl={iconUrl}
				title={`${title}`}
				{...other}
			>
				{content}
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
