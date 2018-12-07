import React from "react";
import { withStyles, Typography } from "@material-ui/core";
import classnames from "classnames";
import { fontFamilyBold } from "../../styles/theme";
import AppButton from "../../elements/AppButton";

const styles = theme => ({
	root: {
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundImage: "url(/images/landing-bg.jpg)",
		height: 600,

		display: "flex",
		flexDirection: "column",
		padding: theme.spacing.unit * 3
	},
	headingContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		textAlign: "center"
	},
	text: {
		color: "#FFFFFF"
	},
	heading: {
		fontSize: theme.typography.fontSize * 4,
		fontFamily: fontFamilyBold,
		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 2.9
		}
	},
	subheading: {
		fontSize: theme.typography.fontSize * 1.6,
		lineSpace: 1,
		[theme.breakpoints.down("sm")]: {
			fontSize: theme.typography.fontSize * 1.4
		}
	},
	availableOn: {
		fontSize: theme.typography.fontSize * 0.9,
		marginRight: theme.spacing.unit
	},
	appLinkContainer: {
		// borderStyle: "solid",
		// borderColor: "red",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",

		[theme.breakpoints.up("sm")]: {
			paddingRight: "6%",
			justifyContent: "flex-end"
		}
	}
});

const Hero = ({ classes }) => (
	<div className={classes.root}>
		<div className={classes.headingContainer}>
			<Typography
				className={classnames({
					[classes.text]: true,
					[classes.heading]: true
				})}
			>
				The Future of Ticketing
			</Typography>
			<Typography
				className={classnames({
					[classes.text]: true,
					[classes.subheading]: true
				})}
			>
				Secure and control every aspect of your experience.
			</Typography>
		</div>

		<div className={classes.appLinkContainer}>
			<Typography
				className={classnames({
					[classes.text]: true,
					[classes.availableOn]: true
				})}
			>
				Available on
			</Typography>
			<AppButton
				size="small"
				variant="ios"
				color="blackBackground"
				href={process.env.REACT_APP_STORE_IOS}
				style={{ minWidth: 80 }}
			>
				iOS
			</AppButton>
			<AppButton
				size="small"
				variant="android"
				color="blackBackground"
				href={process.env.REACT_APP_STORE_ANDROID}
				style={{ minWidth: 80 }}
			>
				Android
			</AppButton>
		</div>
	</div>
);

export default withStyles(styles)(Hero);
