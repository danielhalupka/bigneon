import React from "react";
import PropTypes from "prop-types";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTransition from "../common/DialogTransition";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import Card from "./Card";
import { fontFamilyBold } from "../styles/theme";

const styles = {
	root: {
		borderRadius: 4
	},
	iconDiv: {
		display: "flex",
		justifyContent: "center"
	},
	iconOuter: {
		position: "relative",
		top: -30,
		width: 70,
		height: 70,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)",
		backgroundImage: "linear-gradient(224deg, #e53d96, #5491cc)",
		zIndex: 999999
	},
	icon: {
		width: 35,
		height: 35
	},
	title: {
		marginTop: 40,
		fontFamily: fontFamilyBold,
		textAlign: "center"
	}
};

const CustomDialog = props => {
	const { children, onClose, iconUrl, title, classes, ...rest } = props;

	return (
		<Dialog
			TransitionComponent={DialogTransition}
			onClose={onClose}
			aria-labelledby="dialog-title"
			PaperProps={{
				style: {
					backgroundColor: "transparent",
					borderStyle: "none",
					boxShadow: "none"
				}
			}}
			BackdropProps={{ style: { backgroundColor: "transparent" } }}
			{...rest}
		>
			<Card variant="dialog" iconUrl={iconUrl}>
				{title ? (
					<Typography variant="headline" className={classes.title}>
						{title}
					</Typography>
				) : null}
				<DialogContent>{children}</DialogContent>
			</Card>
		</Dialog>
	);
};

CustomDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string,
	title: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(CustomDialog);
