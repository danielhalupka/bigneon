import React from "react";
import Dialog from "../elements/Dialog";

class AuthenticateCheckDialog extends React.Component {
	render() {
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

export default AuthenticateCheckDialog;
