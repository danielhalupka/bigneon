import React from "react";
import PropTypes from "prop-types";
import Dialog from "../elements/Dialog";

class AuthenticateCheckDialog extends React.Component {
	render() {
		const { classes } = this.props;

		return (
			<Dialog
				open={true}
				title={"Loading..."}
			>
				<div />
			</Dialog>
		);
	}
}

AuthenticateCheckDialog.propTypes = {
	classes: PropTypes.object.isRequired
};

export default AuthenticateCheckDialog;
