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
		backgroundColor: "#19081e",
		backgroundImage: "url(/images/intro-background-dark.png)",
		display: "flex",
		flexDirection: "column",
		minHeight: 800,
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column"
		}
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
		marginTop: 25,
		[theme.breakpoints.up("sm")]: {
			justifyContent: "flex-center"
		}
	},
	mobilePreviewImage: {
		width: 380,
		[theme.breakpoints.up("sm")]: {
			width: 600
		},
		[theme.breakpoints.down("xs")]: {
			width: 300
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
				Download the Big Neon app now to see your favorite live music
			</Typography>
			<div className={classes.appLinkContainer}>
				<AppButton
					size="small"
					variant="ios"
					color="white"
					href={process.env.REACT_APP_STORE_IOS}
					style={{ 
						marginRight: 5
					}}
				>
					iOS
				</AppButton>
				<AppButton
					size="small"
					variant="android"
					color="white"
					href={process.env.REACT_APP_STORE_ANDROID}
					style={{
						marginLeft: 5
					}}
				>
					Android
				</AppButton>
			</div>
		</div>
		<div className={classes.appLinkContainer}>
			<img
				style={{
					flex: 0
				}}
				className={classes.mobilePreviewImage}
				src="/images/iospreview-chopped.png"
			/>
		</div>
	</div>
);

export default withStyles(styles)(Hero);
