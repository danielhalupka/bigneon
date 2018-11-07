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
		}
	}

	componentWillMount(nextProps) {

		// this.loadHold();
	}

	loadHold() {
		const { holdId, eventId } = this.props;

		if (holdId) {
			//Load the hold
			Bigneon().holds.read({ id: holdId }).then(holdData => {
				let hold = holdData.data;
				this.setState({ hold });
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

		Bigneon().holds.comps.create(saveData).then(response => {
			const { id } = response.data;
			this.setState({ isSubmitting: false });
			let message = `Successfully ${comp.id ? "updated" : "created"} comp`;
			notification.show({
				message,
				variant: "success"
			});
			onSuccess(id);
		}).catch(error => {
			console.log(error);
			this.setState({ isSubmitting: false });
			let message = `${comp.id ? "Update" : "Create"} comp failed.`;
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


	render() {
		const { onClose, classes, holdId, ticketTypes, eventId, onSuccess, ...other } = this.props;

		let iconUrl = "/icons/tickets-white-svg.svg";


		const { comp, errors } = this.state;

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
				}}>Add Name to Hold</DialogTitle>
				<DialogContent className={classes.content}>

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
							this.setState({ comp })
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
							this.setState({ comp })
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
							this.setState({ comp })
						}}
						// onBlur={this.validateFields.bind(this)}
					/>

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
						Create
					</Button>
				</DialogActions>
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
