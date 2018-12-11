import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import MenuIcon from "@material-ui/icons/Menu";

import { toolBarHeight } from "../../styles/theme";
import RightUserMenu from "./RightUserMenu";
import SearchToolBarInput from "./SearchToolBarInput";
import CartHeaderLink from "../../common/cart/CartHeaderLink";
import CurrentOrganizationMenu from "./CurrentOrganizationMenu";
import BoxOfficeLink from "./BoxOfficeLink";
import layout from "../../../stores/layout";

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
		headerImage: {
			maxWidth: 140
		},
		rightMenuOptions: {
			alignItems: "center",
			display: "flex"
		}
	};
};

const CustomAppBar = observer(props => {
	const { classes, handleDrawerToggle, history } = props;

	return (
		<AppBar className={classes.appBar}>
			<Toolbar className={classes.toolBar}>
				{handleDrawerToggle ? (
					<Hidden mdUp implementation="css">
						{layout.showSideMenu ? (
							<IconButton
								color="inherit"
								aria-label="open drawer"
								onClick={handleDrawerToggle}
								className={classes.navIconHide}
							>
								<MenuIcon color="action" />
							</IconButton>
						) : (
							<span />
						)}
					</Hidden>
				) : null}
				<div>
					<Link to={"/"}>
						<img
							alt="Header logo"
							className={classes.headerImage}
							src="/images/bn-logo-text.svg"
						/>
					</Link>
				</div>

				<Hidden smDown implementation="css">
					<SearchToolBarInput history={history} />
				</Hidden>

				<span className={classes.rightMenuOptions}>
					<Hidden smDown>
						<BoxOfficeLink />
						<CurrentOrganizationMenu />
						<CartHeaderLink />
					</Hidden>
					<RightUserMenu history={history} />
				</span>
			</Toolbar>
		</AppBar>
	);
});

CustomAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	handleDrawerToggle: PropTypes.func,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(CustomAppBar);
