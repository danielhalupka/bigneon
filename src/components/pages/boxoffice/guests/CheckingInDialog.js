import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "../../../elements/Dialog";
import Button from "../../../elements/Button";

const styles = theme => ({
	content: {
		minWidth: 350,
		alignContent: "center",
		textAlign: "center",
		paddingTop: theme.spacing.unit * 2,

		display: "flex",
		alignItems: "center",
		flexDirection: "column"
	},
	icon: {
		width: 120,
		height: "auto",
		marginBottom: theme.spacing.unit * 3
	}
});

const CheckingInDialog = ({ isCheckingIn, classes, open, onClose }) => {
	return (
		<Dialog
			iconUrl={!isCheckingIn ? "/icons/tickets-white.svg" : null}
			open={open}
			title={isCheckingIn ? "Checking in..." : "Check-in Complete"}
			onClose={isCheckingIn ? null : onClose}
		>
			<div className={classes.content}>
				<img
					className={classes.icon}
					src={`/icons/${
						isCheckingIn ? "tickets" : "checkmark-circle"
					}-multi.svg`}
					alt="Check-In complete"
				/>

				{!isCheckingIn ? (
					<Button
						style={{ width: "100%" }}
						variant="callToAction"
						onClick={onClose}
					>
						Return to Box Office
					</Button>
				) : null}
			</div>
		</Dialog>
	);
};

CheckingInDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	isCheckingIn: PropTypes.bool
};

export default withStyles(styles)(CheckingInDialog);
