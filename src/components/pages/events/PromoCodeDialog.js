import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

import Button from "../../elements/Button";
import DialogTransition from "../../common/DialogTransition";
import InputGroup from "../../common/form/InputGroup";
import Bigneon from "../../../helpers/bigneon";

const styles = theme => ({
	container: {
		minWidth: 400
	}
});

const Transition = props => {
	return <Slide direction="up" {...props} />;
};

class PromoCodeDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			code: "",
			isSubmitting: false,
			error: null
		};
	}

	onSubmit(e) {
		e.preventDefault();

		const { onSuccess } = this.props;
		const { code } = this.state;

		if (!code) {
			return this.setState({ error: "Please enter a promo code." });
		}

		this.setState({ isSubmitting: true });

		//TODO this isn't in the API yet so needs tweaking when the API endpoint is available
		// Bigneon().cart.applyPromo({code})
		// 	.then(response => {
		// 		const { value } = response.data;

		// 		onSuccess(value);
		// 	})
		// 	.catch(error => {
		// 		let message = "Promo code check failed.";

		// 		if (
		// 			error.response &&
		// 			error.response.data &&
		// 			error.response.data.error
		// 		) {
		// 			message = error.response.data.error;
		// 		}
		// 		this.setState({ isSubmitting: false, error: message });
		// 	});
	}

	render() {
		const { classes, open, onSubmit, onCancel } = this.props;

		const { isSubmitting, code, error } = this.state;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				open={open}
				onClose={onCancel}
				aria-labelledby="form-dialog-title"
				TransitionComponent={Transition}
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<DialogTitle id="form-dialog-title">Enter a promo code</DialogTitle>
					<DialogContent className={classes.container}>
						<InputGroup
							error={error}
							value={code}
							name="promo"
							type="text"
							placeholder="BN-123"
							autoFocus
							onChange={e => this.setState({ code: e.target.value })}
						/>

						{/* <TextField
						
						error={error}
							value={code}
							autoFocus
							margin="dense"
							id="name"
							type="text"
							fullWidth
							onChange={e => this.setState({ code: e.target.value })}
						/> */}
					</DialogContent>
					<DialogActions>
						<Button style={{ marginRight: 10 }} onClick={onCancel}>
							Cancel
						</Button>
						&nbsp;
						<Button
							disabled={isSubmitting}
							type="submit"
							customClassName="primary"
						>
							Use
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		);
	}
}

PromoCodeDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PromoCodeDialog);
