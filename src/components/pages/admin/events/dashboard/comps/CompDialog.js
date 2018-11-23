import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import moment from "moment";
import BnServer from "bn-api-node/dist/bundle.client";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import Dialog from "../../../../../elements/Dialog";
import InputGroup from "../../../../../common/form/InputGroup";

const createHold = BnServer.ResourceInterfaces.createHold;

const styles = {
	dialogContent: {},
	group: {
		// margin: `${theme.spacing.unit}px 0`,
	}
};

class CompDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			comp: {
				hold_id: this.props.holdId,
				name: "",
				phone: "",
				email: "",
				quantity: 0
			},
			hold: createHold(),
			errors: {},
			isSubmitting: false
		};
	}

	componentWillMount(nextProps) {
		// this.loadHold();
	}

	loadHold() {
		const { holdId, eventId } = this.props;

		if (holdId) {
			//Load the hold
			Bigneon()
				.holds.read({ id: holdId })
				.then(holdData => {
					let hold = holdData.data;
					this.setState({ hold });
				});
		} else {
			this.setState({
				hold: createHold({
					event_id: eventId,
					end_at: moment()
						.add(1, "year")
						.format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
				})
			});
		}
	}

	submit() {
		const { comp } = this.state;
		const { onSuccess } = this.props;

		this.setState({ isSubmitting: true });

		let { ...saveData } = comp;
		if (saveData.email === "") {
			delete saveData.email;
		}
		if (saveData.phone === "") {
			delete saveData.phone;
		}

		Bigneon()
			.holds.comps.create(saveData)
			.then(response => {
				const { id } = response.data;
				this.setState({ isSubmitting: false });
				let message = `Successfully ${comp.id ? "updated" : "created"} comp`;
				notifications.show({
					message,
					variant: "success"
				});
				onSuccess(id);
			})
			.catch(error => {
				console.log(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: `${comp.id ? "Update" : "Create"} comp failed.`
				});
			});
	}

	render() {
		const {
			onClose,
			classes,
			holdId,
			ticketTypes,
			eventId,
			onSuccess,
			...other
		} = this.props;

		let iconUrl = "/icons/tickets-white.svg";

		const { comp, errors } = this.state;

		let isSubmitting = false;
		return (
			<Dialog
				onClose={onClose}
				title="Add Name to Hold"
				iconUrl={iconUrl}
				{...other}
			>
				<div>
					<InputGroup
						error={errors.name}
						value={comp.name}
						name="name"
						label={"Name"}
						placeholder="- Please enter name"
						autofocus={true}
						type="text"
						onChange={e => {
							comp.name = e.target.value;
							this.setState({ comp });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
					<InputGroup
						error={errors.contact}
						value={comp.email || comp.phone}
						name="email"
						label="Cell Phone Number or Email Address"
						placeholder="- Enter share method (optional)"
						type="text"
						onChange={e => {
							let value = e.target.value.trim();
							if (value.indexOf("@") !== -1) {
								comp.email = value;
								comp.phone = "";
							} else {
								comp.email = "";
								comp.phone = value;
							}
							this.setState({ comp });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>

					<InputGroup
						error={errors.quantity}
						value={comp.quantity}
						name="quantity"
						label="Total Tickets"
						placeholder="1"
						type="text"
						onChange={e => {
							comp.quantity = +e.target.value;
							this.setState({ comp });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
				</div>

				<div style={{ display: "flex" }}>
					<Button
						style={{ marginRight: 5, flex: 1 }}
						onClick={onClose}
						color="primary"
					>
						Cancel
					</Button>
					<Button
						style={{ marginLeft: 5, flex: 1 }}
						type="submit"
						variant="callToAction"
						onClick={this.submit.bind(this)}
					>
						Create
					</Button>
				</div>
			</Dialog>
		);
	}
}

CompDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	holdId: PropTypes.string,
	eventId: PropTypes.string,
	ticketTypes: PropTypes.array,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(CompDialog);
