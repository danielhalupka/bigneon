import React from "react";
import PropTypes from "prop-types";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Slide from "@material-ui/core/Slide";
import { withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import Card from "./Card";
import { fontFamilyBold } from "../styles/theme";
import TopCardIcon from "./TopCardIcon";
import iosScrollBackgroundHack from "../../helpers/iosScrollBackgroundHack";

const styles = theme => ({
	root: {
		borderRadius: 4
	},
	paper: {
		backgroundColor: "transparent",
		outline: "none",
		boxShadow: "none"
	},
	content: {
		maxWidth: 600,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		[theme.breakpoints.down("sm")]: {
			paddingLeft: theme.spacing.unit,
			paddingRight: theme.spacing.unit
		}
	},
	mobileContent: {
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit
	},
	title: {
		marginTop: 40,
		fontFamily: fontFamilyBold,
		textAlign: "center"
	},
	closeDialogContainer: {
		display: "flex",
		justifyContent: "flex-end",
		paddingRight: theme.spacing.unit * 1.5,
		paddingTop: theme.spacing.unit * 1.5
	},
	closeIcon: {
		width: 18,
		height: 18
	}
});

const DialogTransition = props => {
	return <Slide direction="up" {...props}/>;
};

const CustomDialog = props => {
	const { children, onClose, iconUrl, title, classes, ...rest } = props;

	const screenWidth = Math.max(
		document.body.scrollWidth,
		document.documentElement.scrollWidth,
		document.body.offsetWidth,
		document.documentElement.offsetWidth,
		document.documentElement.clientWidth
	);

	//Mobile full screen dialog
	if (screenWidth < 500) {
		return (
			<Dialog
				fullScreen
				TransitionComponent={DialogTransition}
				onClose={onClose}
				aria-labelledby="dialog-title"
				onEntering={() => iosScrollBackgroundHack(true)}
				onExiting={() => iosScrollBackgroundHack(false)}
				{...rest}
			>
				<div>
					<div onClick={onClose} className={classes.closeDialogContainer}>
						<img alt="close" className={classes.closeIcon} src="/icons/delete-active.svg"/>
					</div>
					{iconUrl ? <TopCardIcon iconUrl={iconUrl}/> : null}
					{title ? (
						<Typography variant="headline" className={classes.title}>
							{title}
						</Typography>
					) : null}
					<div className={classes.mobileContent}>{children}</div>
				</div>
			</Dialog>
		);
	}

	return (
		<Dialog
			TransitionComponent={DialogTransition}
			onClose={onClose}
			aria-labelledby="dialog-title"
			PaperProps={{
				className: classes.paper
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
				<DialogContent className={classes.content}>{children}</DialogContent>
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
