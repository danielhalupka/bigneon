import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Bigneon from "../../../helpers/bigneon";
import notification from "../../../stores/notifications";
import Dialog from "../../elements/Dialog";

const styles = {
	content: {
		minWidth: 400,
		alignContent: "center",
		textAlign: "center"
	}
};

class CheckoutDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// const { ticket } = this.props;
		// if (ticket) {
		// 	if (!prevProps.ticket || ticket.id !== prevProps.ticket.id) {
		// 		this.refreshQrText();
		// 	}
		// }
	}

	render() {
		const { onClose, classes, ...other } = this.props;
		return (
			<Dialog onClose={onClose} {...other}>
				<div className={classes.content}>
					<Typography variant="subheading">Checkout coming soon</Typography>
				</div>
			</Dialog>
		);
	}
}

CheckoutDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(CheckoutDialog);
