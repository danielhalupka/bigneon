import React from "react";
import { Dialog, Typography } from "@material-ui/core";
import Loader from "../elements/loaders/Loader";

class AuthenticateCheckDialog extends React.Component {
	render() {
		return (
			<Dialog
				open={true}
			>
				<div style={{ padding: 20 }}>
					<Loader/>
				</div>
			</Dialog>
		);
	}
}

export default AuthenticateCheckDialog;
