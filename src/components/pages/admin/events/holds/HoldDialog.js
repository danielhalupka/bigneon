import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import InputGroup from "../../../../common/form/InputGroup";

import { primaryHex } from "../../../../styles/theme";
import DialogTransition from "../../../../common/DialogTransition";
import Bigneon from "../../../../../helpers/bigneon";
import BnServer from "bn-api-node/dist/bundle.client";

const createHold = BnServer.ResourceInterfaces.createHold;
import notification from "../../../../../stores/notifications";
import { DialogActions, DialogContentText, Grid } from "@material-ui/core";
import AutoCompleteGroup from "../../../../common/form/AutoCompleteGroup";
import Button from "../../../../elements/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import moment from "moment";
import TopCardIcon from "../../../../elements/TopCardIcon";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";


const styles = {
	dialogContent: {},
	group: {
		// margin: `${theme.spacing.unit}px 0`,
	},
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
			hold: createHold(),
			parentHold: createHold(),
			errors: {},
			isSubmitting: false
		}
	}

	componentWillMount(nextProps) {
		this.loadHold();
	}

	loadHold() {
		const { holdType, holdId, eventId } = this.props;

		if (holdId) {
			//Load the hold
			Bigneon().holds.read({ id: holdId }).then(holdData => {
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
				hold: createHold({
					event_id: eventId,
					end_at: moment().add(1, "year").format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
				})
			});
		}
	}

	submit() {
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

		storeFunction(hold).then(response => {
			const { id } = response.data;
			this.setState({ isSubmitting: false });
			let message = `Successfully ${hold.id ? "updated" : "created"} hold`;
			notification.show({
				message,
				variant: "success"
			});
			onSuccess(id);
		}).catch(error => {
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
		})
	}

	renderTicketTypesOrMaxPerOrder() {
		const { holdType, ticketTypes } = this.props;
		const { hold, errors } = this.state;

		if (holdType === HOLD_TYPES.SPLIT) {
			return (
				<Grid item xs={12}>
					<InputGroup
						error={errors.max_per_order}
						value={hold.max_per_order}
						name="max_per_order"
						label="Max Per Order"
						placeholder="1"
						type="text"
						onChange={e => {
							hold.max_per_order = +e.target.value;
							this.setState({ hold })
						}}
					/>
				</Grid>
			);
		}

		const ticketTypeHash = {};
		ticketTypes.forEach(ticketType => {
			ticketTypeHash[ticketType.id] = ticketType.name;
		});


		let selectedTicketType = hold.ticket_type_id ? {
			value: hold.ticket_type_id,
			label: ticketTypeHash[hold.ticket_type_id] || ""
		} : "";

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
				<Grid container>
					<Grid item xs={6}>
						<InputGroup
							value={totalHeld}
							name="total_held"
							label="Total Held"
							placeholder="100"
							type="text"
							disabled={true}
							onChange={e => {
							}}
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
			)
		}


		return (
			<Grid container>

				<Grid item xs={6}>
					<InputGroup
						error={errors.quantity}
						value={hold.quantity}
						name="quantity"
						label="Total Held"
						placeholder="100"
						type="number"
						onChange={e => {
							hold.quantity = +e.target.value;
							this.setState({ hold })
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
				</Grid>
				<Grid item xs={6}>
					<InputGroup
						error={errors.max_per_order}
						value={hold.max_per_order}
						name="max_per_order"
						label="Max Per Order"
						placeholder="1"
						type="number"
						onChange={e => {
							hold.max_per_order = +e.target.value;
							this.setState({ hold })
						}}
					/>
				</Grid>
			</Grid>
		)
	}

	render() {
		const { holdType = HOLD_TYPES.NEW, onClose, classes, holdId, ticketTypes, eventId, onSuccess, ...other } = this.props;

		let iconUrl = "/icons/tickets-white-svg.svg";
		let title = "Create";
		let nameField = "Name (For Reports)";
		let saveButtonText = "Create";
		switch (holdType) {
			case HOLD_TYPES.SPLIT:
				nameField = "New Hold Name (For Reports)";
				iconUrl = "/icons/split-gray.svg";
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

		let isSubmitting = false;
		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={onClose}
				aria-labelledby="dialog-title"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
				{...other}
			>

				<TopCardIcon iconUrl={iconUrl}/>
				<DialogTitle id="dialog-title" style={{
					textAlign: "center",
					marginTop: "40px"
				}}>{title} Hold</DialogTitle>
				<DialogContent className={classes.content}>

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
							this.setState({ hold })
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
							this.setState({ hold })
						}}
						// onBlur={this.validateFields.bind(this)}
					/>

					{this.renderTicketTypesOrMaxPerOrder()}
					<Grid container>

						<Grid item xs={12}>
							<RadioGroup
								aria-label="hold-type"
								name="hold-type"
								className={classes.group}
								value={hold.hold_type}
								onChange={(e) => {
									hold.hold_type = e.target.value;
									if (hold.hold_type === "Comp") {
										hold.discount_in_cents = 0;
									}
									this.setState({ hold });
								}}
							>
								<FormControlLabel
									value="Discount"
									control={<Radio color="secondary"/>}
									label="Discount"
								/>
								<FormControlLabel
									value="Comp"
									control={<Radio color="secondary"/>}
									label="Comp"
								/>
							</RadioGroup>
						</Grid>
						<Grid item xs={6}>
							<InputGroup
								error={errors.discount_in_cents}
								value={hold.discount_in_cents}
								name="discount_in_cents"
								label="Discount"
								placeholder="0"
								type="number"
								disabled={hold.hold_type === "Comp"}
								onChange={e => {
									hold.discount_in_cents = +e.target.value;
									this.setState({ hold })
								}}
								// onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
						<Grid item xs={6}>
							<InputGroup
								error={errors.end_at}
								value={hold.end_at}
								name="end_at"
								label="Auto Release Date"
								placeholder="Never"
								type="text"
								onChange={e => {
									hold.end_at = e.target.value;
									this.setState({ hold })
								}}
								// onBlur={this.validateFields.bind(this)}
							/>
						</Grid>
					</Grid>
					{this.renderQuantities()}

				</DialogContent>
				<DialogActions>
					<Button
						style={{ marginRight: 10 }}
						onClick={onClose}
						color="primary"
					>
						Cancel
					</Button>
					<Button type="submit" variant="callToAction" onClick={this.submit.bind(this)}>
						{saveButtonText}
					</Button>
				</DialogActions>
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
