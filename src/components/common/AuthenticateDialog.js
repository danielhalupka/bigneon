import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";

const styles = theme => {
	return {
		root: { backgroundColor: theme.palette.grey.A300 }
	};
};

class AuthenticateDialog extends React.Component {
	render() {
		const { classes } = this.props;

		return (
			<Dialog
				aria-labelledby="please-authenticate"
				{...this.props}
				className={classes.root}
			>
				<DialogTitle id="please-authenticate">
					Authentication required
				</DialogTitle>
				<div>
					<Link to={"/sign-up"} style={{ textDecoration: "none" }}>
						<Button>Sign up</Button>
					</Link>
					<Link to={"/login"} style={{ textDecoration: "none" }}>
						<Button>Login</Button>
					</Link>
				</div>
			</Dialog>
		);
	}
}

AuthenticateDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired
};

export default withStyles(styles)(AuthenticateDialog);
