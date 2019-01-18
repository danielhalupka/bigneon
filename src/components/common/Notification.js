//This is included once in Content.js and uses the notifications.js store to show/hide the messages globally
import React from "react";
import { observer } from "mobx-react";
import Snackbar from "@material-ui/core/Snackbar";
import Portal from "@material-ui/core/Portal";
import PropTypes from "prop-types";
import classNames from "classnames";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import green from "@material-ui/core/colors/green";
import amber from "@material-ui/core/colors/amber";
import IconButton from "@material-ui/core/IconButton";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { withStyles } from "@material-ui/core/styles";

import notification from "../../stores/notifications";

const variantIcon = {
	success: CheckCircleIcon,
	warning: WarningIcon,
	error: ErrorIcon,
	info: InfoIcon
};

const styles = theme => ({
	success: {
		backgroundColor: green[600]
	},
	error: {
		backgroundColor: theme.palette.error.dark
	},
	info: {
		backgroundColor: theme.palette.primary.dark
	},
	warning: {
		backgroundColor: amber[700]
	},
	icon: {
		fontSize: 20
	},
	iconVariant: {
		opacity: 0.9,
		marginRight: theme.spacing.unit
	},
	message: {
		display: "flex",
		alignItems: "center"
	}
});

const CustomSnackbarContent = props => {
	const { classes, className, message, onClose, variant, ...other } = props;
	const Icon = variantIcon[variant];

	return (
		<SnackbarContent
			className={classNames(classes[variant], className)}
			aria-describedby="client-snackbar"
			message={
				(<span id="client-snackbar" className={classes.message}>
					<Icon className={classNames(classes.icon, classes.iconVariant)}/>
					{message}
				</span>)
			}
			action={[
				<IconButton
					key="close"
					aria-label="Close"
					color="inherit"
					className={classes.close}
					onClick={onClose}
				>
					<CloseIcon className={classes.icon}/>
				</IconButton>
			]}
			{...other}
		/>
	);
};

CustomSnackbarContent.propTypes = {
	classes: PropTypes.object.isRequired,
	className: PropTypes.string,
	message: PropTypes.node,
	onClose: PropTypes.func,
	variant: PropTypes.oneOf(["success", "warning", "error", "info"]).isRequired
};

const SnackbarContentWrapper = withStyles(styles)(CustomSnackbarContent);

const Notification = observer(() => (
	<Portal>
		<Snackbar
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			open={notification.isOpen}
			onClose={() => notification.hide()}
			ContentProps={{
				"aria-describedby": `message-${notification.message}`
			}}
			message={<span id="message-id">{notification.message}</span>}
		>
			<SnackbarContentWrapper
				variant={notification.variant}
				message="This is a warning message!"
				open={notification.isOpen}
				onClose={() => notification.hide()}
				message={<span id="message-id">{notification.message}</span>}
			/>
		</Snackbar>
	</Portal>
));

export default Notification;
