import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import {
	DialogContent,
	DialogContentText,
	DialogActions,
	Typography
} from "@material-ui/core";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";
import DialogTransition from "../../../common/DialogTransition";

const styles = {};

class CancelEventDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			isSubmitting: false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		//TODO check if the ID changed, if it did pull the event details into state
		const { id } = this.props;

		if (id && prevProps.id !== id) {
			Bigneon()
				.events.read({ id })
				.then(response => {
					const { artists, organization, venue, ...event } = response.data;
					const { name } = event;
					this.setState({
						name
					});
				})
				.catch(error => {
					console.error(error);
					let message = "Loading event details failed.";
					if (
						error.response &&
						error.response.data &&
						error.response.data.error
					) {
						message = error.response.data.error;
					}

					notifications.show({
						message,
						variant: "error"
					});
				});
		}
	}

	onSubmit(e) {
		e.preventDefault();

		const { onClose, id } = this.props;

		this.setState({ isSubmitting: true });

		Bigneon()
			.events.del({ id })
			.then(response => {
				this.setState({ isSubmitting: false }, () => onClose());
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Cancelling event details failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	render() {
		const { onClose, id } = this.props;
		const { name, isSubmitting } = this.state;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				open={!!id}
				onClose={onClose}
				aria-labelledby="simple-dialog-title"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<DialogTitle id="simple-dialog-title">Cancel event</DialogTitle>

					<DialogContent>
						<DialogContentText>
							Are you sure you want to cancel this event?
						</DialogContentText>
						{name ? <Typography variant="display1">{name}</Typography> : null}
					</DialogContent>
					<DialogActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={onClose}
							color="primary"
						>
							Keep event
						</Button>
						<Button disabled={isSubmitting} type="submit" variant="warning">
							{isSubmitting ? "Cancelling..." : "Cancel event"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
}

CancelEventDialog.propTypes = {
	id: PropTypes.string,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(CancelEventDialog);
