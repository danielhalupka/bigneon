import React from "react";
import { Dialog, Typography } from "@material-ui/core";

class AuthenticateCheckDialog extends React.Component {
	render() {
		return (
			<Dialog
				open={true}
			>
				<div style={{ padding: 20 }}>
					<Typography>Loading...</Typography>
				</div>
			</Dialog>
		);
	}
}

export default AuthenticateCheckDialog;
