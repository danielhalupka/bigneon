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

const CheckInSuccessDialog = ({ classes, open, onClose }) => {
	return (
		<Dialog open={open} onClose={onClose} title="Check-in Complete">
			<div className={classes.content}>
				<img
					className={classes.icon}
					src="/icons/checkmark-circle-multi.svg"
					alt="Check-In complete"
				/>

				<Button
					style={{ width: "100%" }}
					variant="callToAction"
					onClick={onClose}
				>
					Return to Box Office
				</Button>
			</div>
		</Dialog>
	);
};

CheckInSuccessDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(CheckInSuccessDialog);
