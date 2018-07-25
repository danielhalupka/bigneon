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

class AuthenticateCheckDialog extends React.Component {
	render() {
		const { classes, isLoading, open } = this.props;

		return (
			<Dialog
				aria-labelledby="please-authenticate"
				open={open}
				className={classes.root}
			>
				<DialogTitle id="please-authenticate">
					{isLoading ? "Loading..." : "Authentication required"}
				</DialogTitle>
				{!isLoading ? (
					<div>
						<Link to={"/sign-up"} style={{ textDecoration: "none" }}>
							<Button>Sign up</Button>
						</Link>
						<Link to={"/login"} style={{ textDecoration: "none" }}>
							<Button>Login</Button>
						</Link>
					</div>
				) : null}
			</Dialog>
		);
	}
}

AuthenticateCheckDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired
};

export default withStyles(styles)(AuthenticateCheckDialog);
