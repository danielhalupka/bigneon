import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
// import DevTools from "mobx-react-devtools";
import MuiPickersUtilsProvider from "material-ui-pickers/utils/MuiPickersUtilsProvider";
import MomentUtils from "material-ui-pickers/utils/moment-utils";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import MenuIcon from "@material-ui/icons/Menu";

import MenuContent from "./MenuContent";
import RightHeaderMenu from "./RightHeaderMenu";
import Notification from "../common/Notification";
import user from "../../stores/user";
import CartMobileBottomBar from "./cart/CartMobileBottomBar";

const drawerWidth = 240;

const styles = theme => ({
	root: {
		flexGrow: 1,
		height: "100%",
		zIndex: 1,
		overflow: "hidden",
		position: "relative",
		display: "flex",
		width: "100%"
	},
	appBar: {
		position: "absolute",
		marginLeft: drawerWidth,
		[theme.breakpoints.up("md")]: {
			width: `calc(100% - ${drawerWidth}px)`
		}
	},
	headerImage: {
		width: 180
	},
	navIconHide: {
		[theme.breakpoints.up("md")]: {
			display: "none"
		}
	},
	toolbar: theme.mixins.toolbar,
	drawerPaper: {
		width: drawerWidth,
		[theme.breakpoints.up("md")]: {
			position: "relative"
		}
	},
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3,
		paddingBottom: theme.spacing.unit * 10
	}
});

@observer
class Container extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			mobileOpen: false
		};
	}

	componentDidMount() {
		//This component mounts every time the browser is refreshed, so we need to check we still have a valid token
		user.refreshUser();
	}

	handleDrawerToggle() {
		this.setState(state => ({ mobileOpen: !state.mobileOpen }));
	}

	render() {
		const { classes, history, children } = this.props;
		const { mobileOpen } = this.state;

		const drawer = (
			<div>
				<MenuContent toggleDrawer={this.handleDrawerToggle.bind(this)} />
			</div>
		);

		return (
			<MuiPickersUtilsProvider utils={MomentUtils}>
				<div className={classes.root}>
					<AppBar className={classes.appBar}>
						<Toolbar>
							<IconButton
								color="inherit"
								aria-label="open drawer"
								onClick={this.handleDrawerToggle.bind(this)}
								className={classes.navIconHide}
							>
								<MenuIcon color="action" />
							</IconButton>
							<div style={{ flex: 1 }}>
								<Hidden mdUp implementation="css">
									<Link to={"/"}>
										<img
											alt="Header logo"
											className={classes.headerImage}
											src="/images/bn-logo-text.png"
										/>
									</Link>
								</Hidden>
							</div>

							<RightHeaderMenu history={history} />
						</Toolbar>
					</AppBar>
					<Hidden mdUp>
						<SwipeableDrawer
							variant="temporary"
							anchor={"left"}
							open={mobileOpen}
							onOpen={this.handleDrawerToggle.bind(this)}
							onClose={this.handleDrawerToggle.bind(this)}
							classes={{
								paper: classes.drawerPaper
							}}
							ModalProps={{
								keepMounted: true // Better open performance on mobile.
							}}
						>
							{drawer}
						</SwipeableDrawer>
					</Hidden>
					<Hidden smDown implementation="css">
						<Drawer
							variant="permanent"
							open
							classes={{
								paper: classes.drawerPaper
							}}
						>
							{drawer}
						</Drawer>
					</Hidden>
					<main className={classes.content}>
						<div className={classes.toolbar} />
						{children}
						<Notification />
					</main>
				</div>
				<CartMobileBottomBar />
			</MuiPickersUtilsProvider>
		);
	}
}

Container.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.element.isRequired
};

export default withStyles(styles)(withRouter(Container));
