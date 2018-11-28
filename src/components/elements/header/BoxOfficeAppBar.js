import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import MenuIcon from "@material-ui/icons/Menu";

import { toolBarHeight } from "../../styles/theme";
import RightUserMenu from "./RightUserMenu";
import BoxOfficeLink from "./BoxOfficeLink";
import BoxOfficeEventSelection from "./BoxOfficeEventSelection";

const styles = theme => {
	return {
		root: {
			position: "absolute",
			padding: 0
		},
		toolBar: {
			paddingRight: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2,
			display: "flex",
			justifyContent: "space-between",
			...toolBarHeight
		},
		logoContainer: {
			display: "flex",
			alignItems: "center"
		},
		headerImage: {
			maxWidth: 45,
			width: "auto"
		},
		rightMenuOptions: {
			alignItems: "center",
			display: "flex"
		},
		verticalDivider: {
			borderLeft: "1px solid #DEE2E8",
			height: 50,
			marginLeft: theme.spacing.unit * 2
		}
	};
};

const BoxOfficeAppBar = props => {
	const { classes, handleDrawerToggle, history } = props;

	return (
		<AppBar className={classes.appBar}>
			<Toolbar className={classes.toolBar}>
				{handleDrawerToggle ? (
					<Hidden mdUp implementation="css">
						<IconButton
							color="inherit"
							aria-label="open drawer"
							onClick={handleDrawerToggle}
							className={classes.navIconHide}
						>
							<MenuIcon color="action" />
						</IconButton>
					</Hidden>
				) : null}
				<div className={classes.logoContainer}>
					<Link to={"/box-office/sell"}>
						<img
							alt="Header logo"
							className={classes.headerImage}
							src="/images/bn-logo.png"
						/>
					</Link>
					<Hidden smDown>
						<div className={classes.verticalDivider} />
					</Hidden>

					<BoxOfficeEventSelection />
				</div>
				<span className={classes.rightMenuOptions}>
					<Hidden smDown>
						<BoxOfficeLink />
					</Hidden>
					<RightUserMenu history={history} />
				</span>
			</Toolbar>
		</AppBar>
	);
};

BoxOfficeAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	handleDrawerToggle: PropTypes.func,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(BoxOfficeAppBar);
