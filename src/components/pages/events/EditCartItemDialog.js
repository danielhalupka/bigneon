import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

import InputGroup from "../../common/form/InputGroup";
import Button from "../../elements/Button";
import DialogTransition from "../../common/DialogTransition";
import cart from "../../../stores/cart";
import notification from "../../../stores/notifications";

const styles = {};

class EditCartItemDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			quantity: 0,
			isSubmitting: false,
			error: null
		};

		this.attemptClose = this.attemptClose.bind(this);
	}

	onUpdate() {
		const { id, ticketTypeId, onClose } = this.props;
		const { quantity } = this.state;

		this.setState({ isSubmitting: true });

		const selectedTickets = {};
		selectedTickets[ticketTypeId] = quantity;
		cart.update(
			selectedTickets,
			() => {
				notification.show({
					message: `Updated ticket quantity.`,
					variant: "success"
				});
				onClose();
			},
			error => {
				onClose();
				notification.show({
					message: "Failed to add items to cart.",
					variant: "error"
				});
				console.error(error);
			}
		);
	}

	attemptClose() {
		//Just check we're not in the middle of an update
		const { onClose } = this.props;
		const { isSubmitting } = this.state;

		if (!isSubmitting) {
			onClose();
		}
	}

	componentDidUpdate(prevProps) {
		const { id, quantity } = this.props;
		if (id !== prevProps.id) {
			this.setState({ quantity, isSubmitting: false });
		}
	}

	render() {
		const {
			classes,
			id,
			onClose,
			priceInCents,
			name,
			ticketTypeId,
			...rest
		} = this.props;
		const { quantity, isSubmitting, error } = this.state;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={this.attemptClose}
				aria-labelledby="simple-dialog-title"
				open={!!id}
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
				{...rest}
			>
				<DialogTitle id="simple-dialog-title">
					Edit ticket quantities
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-slide-description">
						{name}
					</DialogContentText>
					<Grid alignItems="center" container>
						<Grid item xs={12}>
							<InputGroup
								disabled={isSubmitting}
								error={error}
								value={quantity || ""}
								name="amount"
								type="number"
								onChange={e => this.setState({ quantity: e.target.value })}
								placeholder="0"
							/>
						</Grid>

						<Grid item xs={6}>
							<Typography variant="subheading">Price</Typography>
							<Typography variant="body1">
								$ {Math.round(priceInCents / 100)}
							</Typography>
						</Grid>

						<Grid item xs={6}>
							<Typography variant="subheading">Subtotal</Typography>
							<Typography variant="body1">
								$ {Math.round((priceInCents / 100) * quantity)}
							</Typography>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button disabled={isSubmitting} onClick={this.attemptClose}>
						Cancel
					</Button>
					<Button
						autoFocus
						variant="primary"
						disabled={isSubmitting}
						onClick={this.onUpdate.bind(this)}
					>
						{isSubmitting ? "Updating..." : "Update"}
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

EditCartItemDialog.propTypes = {
	id: PropTypes.string,
	ticketTypeId: PropTypes.string,
	name: PropTypes.string,
	priceInCents: PropTypes.number,
	quantity: PropTypes.number,
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(EditCartItemDialog);
