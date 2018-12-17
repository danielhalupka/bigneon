import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { callToActionBackground, fontFamilyDemiBold } from "../../styles/theme";
import AppButton from "../AppButton";

//TODO change external links
const rootUrl = "https://www.bigneon.com";
const links = [
	//{ label: "About Us", href: `${rootUrl}/about` },
	//{ label: "Venues & Promoters", href: `${rootUrl}/venues-and-promoters` },
	//{ label: "News", href: `${rootUrl}/blog` },
	//{ label: "FAQ", href: `${rootUrl}/faq` },
	{ label: "Get in Touch", href: `${rootUrl}/#contact-chat` }
];

const privacyPolicyLink = `${rootUrl}/privacy.html`;
const termsLink = `${rootUrl}/terms.html`;

const styles = theme => ({
	root: {
		flex: 1,
		display: "flex",
		justifyContent: "center",
		marginTop: theme.spacing.unit * 10,
		textAlign: "center",
		backgroundColor: "#FFFFFF"
	},
	content: {
		width: "100%",
		maxWidth: 1200,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	copyrightContainer: {
		paddingBottom: theme.spacing.unit * 2
	},
	copyright: {
		fontSize: theme.typography.fontSize * 0.7
	},
	appLinksContainers: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: theme.spacing.unit * 2
	},
	appLinkSpacer: {
		marginRight: theme.spacing.unit * 2
	},
	linksContainer: {
		display: "flex",
		justifyContent: "center",
		paddingBottom: theme.spacing.unit * 2,

		[theme.breakpoints.down("sm")]: {
			flexDirection: "column"
		}
	},
	linkContainer: {
		[theme.breakpoints.down("sm")]: {
			marginBottom: theme.spacing.unit * 2
		}
	},
	link: {
		color: "#3C383F",
		fontFamily: fontFamilyDemiBold,
		marginRight: theme.spacing.unit,
		marginLeft: theme.spacing.unit
	},
	logoContainer: {
		paddingTop: theme.spacing.unit * 3,
		paddingBottom: theme.spacing.unit
	},
	logo: {
		height: 50,
		width: "auto"
	},
	termsLink: {
		color: "#3C383F",
		marginRight: theme.spacing.unit,
		marginLeft: theme.spacing.unit
	},
	bottomBorder: {
		height: 5,
		backgroundImage: callToActionBackground
	}
});

const Footer = props => {
	const { classes } = props;

	return (
		<div className={classes.root}>
			<div className={classes.content}>
				<div className={classes.logoContainer}>
					<img
						alt={"Footer icon"}
						src={"/images/bn-logo.png"}
						className={classes.logo}
					/>
				</div>

				<img />

				<div className={classes.linksContainer}>
					{links.map(({ label, href }, index) => (
						<Typography className={classes.linkContainer} key={index}>
							<a className={classes.link} href={href} target="_blank">
								{label}
							</a>
						</Typography>
					))}
				</div>

				<div className={classes.appLinksContainers}>
					<AppButton
						variant="ios"
						color="black"
						href={process.env.REACT_APP_STORE_IOS}
					>
						iOS
					</AppButton>
					<span className={classes.appLinkSpacer} />
					<AppButton
						variant="android"
						color="black"
						href={process.env.REACT_APP_STORE_ANDROID}
					>
						Android
					</AppButton>
				</div>
				<div className={classes.copyrightContainer}>
					<Typography className={classes.copyright}>
						Copyright 2018. Big Neon LLC. All Rights Reserved.
						<a
							className={classes.termsLink}
							href={privacyPolicyLink}
							target="_blank"
						>
							Privacy Policy
						</a>
						<a className={classes.termsLink} href={termsLink} target="_blank">
							Terms of Use
						</a>
					</Typography>
				</div>
				<div className={classes.bottomBorder} />
			</div>
		</div>
	);
};

Footer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Footer);
