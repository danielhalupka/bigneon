import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Hidden } from "@material-ui/core";

import { secondaryHex } from "../../styles/theme";
import StyledLink from "../StyledLink";

const styles = theme => ({
	root: {
		flex: 1,
		display: "flex",
		justifyContent: "center",
		paddingTop: theme.spacing.unit * 10
	},
	content: {
		width: "100%",
		maxWidth: 1200,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	row: {
		display: "flex",
		paddingBottom: theme.spacing.unit * 2
	},
	logoContainer: {
		flex: 1,
		display: "flex",
		alignItems: "center"
	},
	logo: {
		height: 30,
		width: "auto"
	},
	linksContainer: {
		flex: 3,
		display: "flex",
		justifyContent: "flex-start",
		alignItems: "center"
	},
	paymentLogosContainer: {
		flex: 3,
		display: "flex",
		justifyContent: "flex-start",
		alignItems: "center",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	paymentLogos: {
		width: "100%",
		height: "auto"
	},
	bottomBorder: {
		height: 5,
		backgroundColor: secondaryHex
	},
	linkText: {
		color: "#3C383F",
		marginRight: theme.spacing.unit,
		fontSize: theme.typography.fontSize * 0.9
	},
	copyrightContainer: {
		flex: 2,
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end"
	},
	copyright: {
		fontSize: theme.typography.fontSize * 0.7,
		textAlign: "right"
	}
});

const Footer = props => {
	const { classes } = props;

	return (
		<div className={classes.root}>
			<div className={classes.content}>
				<div className={classes.row}>
					<div className={classes.logoContainer}>
						<img
							alt={"Footer icon"}
							src={"/images/footer-logo.png"}
							className={classes.logo}
						/>
					</div>

					<div className={classes.linksContainer}>
						<Typography className={classes.linkText}>
							<StyledLink to="/help">Help.</StyledLink>
						</Typography>

						<Typography className={classes.linkText}>
							<StyledLink to="/faq">FAQ.</StyledLink>
						</Typography>

						<Typography className={classes.linkText}>
							<StyledLink to="/contact-us">Contact us.</StyledLink>
						</Typography>

						<Typography className={classes.linkText}>
							<StyledLink to="/terms">Terms of use.</StyledLink>
						</Typography>

						<Typography className={classes.linkText}>
							<StyledLink to="/privacy">Privacy policy.</StyledLink>
						</Typography>
					</div>

					<div className={classes.paymentLogosContainer}>
						<img
							alt={"Payment logos"}
							src={"/images/payment-logos.png"}
							className={classes.paymentLogos}
						/>
					</div>

					<div className={classes.copyrightContainer}>
						<Typography className={classes.copyright}>
							Copyright 2018. Big Neon LLC. All Rights Reserved.
						</Typography>
					</div>
				</div>

				<div className={classes.bottomBorder}/>
			</div>
		</div>
	);
};

Footer.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Footer);
