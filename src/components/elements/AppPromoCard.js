import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import classNames from "classnames";
import { Typography, Hidden } from "@material-ui/core";
import AppButton from "./AppButton";
import { fontFamilyDemiBold } from "../styles/theme";

const styles = theme => ({
	root: {
		borderRadius: 8,

		minHeight: 350,
		width: "100%",

		backgroundImage: "url(/images/app-promo-background.png)",

		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		display: "flex",
		justifyContent: "space-between"

		// paddingTop: theme.spacing.unit * 2,
		// paddingLeft: theme.spacing.unit * 2,
		// paddingRight: theme.spacing.unit * 2

		//borderStyle: "solid"
	},
	appContainer: {
		//borderStyle: "solid",
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "flex-end",
		paddingRight: theme.spacing.unit * 8
	},
	app: {
		height: "80%",
		width: "auto"
	},
	infoContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around",
		padding: theme.spacing.unit * 5
	},
	desktopActionButtons: {
		display: "flex"
	},
	mobileActionButtons: {},
	text: {
		color: "#FFFFFF"
	},
	text1: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.4
	},
	text2: {
		fontSize: theme.typography.fontSize * 4,
		lineHeight: 0.9
	},
	text3: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.4,
		lineHeight: 0.8
	},
	text4: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2
	}
});

const AppPromoCard = props => {
	const { classes, style } = props;

	//images/simple-app-promo.png
	return (
		<div className={classes.root} style={style}>
			<div className={classes.infoContainer}>
				<Typography
					className={classNames({
						[classes.text]: true,
						[classes.text1]: true
					})}
				>
					Get the
				</Typography>

				<div>
					<Typography
						className={classNames({
							[classes.text]: true,
							[classes.text2]: true
						})}
					>
						Big Neon App
					</Typography>
					<Typography
						className={classNames({
							[classes.text]: true,
							[classes.text3]: true
						})}
					>
						To access your tickets
					</Typography>
				</div>

				<Typography
					className={classNames({
						[classes.text]: true,
						[classes.text4]: true
					})}
				>
					The mobile app is required to use
					<br />
					your tickets at the show
				</Typography>

				<Hidden smDown>
					<div className={classes.desktopActionButtons}>
						<AppButton
							color="blackBackground"
							variant="ios"
							href={process.env.REACT_APP_STORE_IOS}
							style={{ marginRight: 5 }}
						>
							iOS
						</AppButton>
						<AppButton
							color="blackBackground"
							variant="android"
							href={process.env.REACT_APP_STORE_ANDROID}
							style={{ marginRight: 5 }}
						>
							Android
						</AppButton>
					</div>
				</Hidden>
				<Hidden mdUp>
					<div className={classes.mobileActionButtons}>
						<AppButton
							color="blackBackground"
							variant="ios"
							href={process.env.REACT_APP_STORE_IOS}
							style={{ marginBottom: 10, marginTop: 10, width: "100%" }}
						>
							iOS
						</AppButton>
						<AppButton
							color="blackBackground"
							variant="android"
							href={process.env.REACT_APP_STORE_ANDROID}
							style={{ width: "100%" }}
						>
							Android
						</AppButton>
					</div>
				</Hidden>
			</div>
			<Hidden smDown>
				<div className={classes.appContainer}>
					<img
						className={classes.app}
						alt="Download our app"
						src="/images/simple-app-promo.png"
					/>
				</div>
			</Hidden>
		</div>
	);
};

AppPromoCard.defaultPropTypes = {
	style: {}
};

AppPromoCard.propTypes = {
	classes: PropTypes.object.isRequired,
	style: PropTypes.object
};

export default withStyles(styles)(AppPromoCard);
