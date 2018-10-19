import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
// import DevTools from "mobx-react-devtools";

import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Hidden from "@material-ui/core/Hidden";

import AppBar from "./header/AppBar";
import MenuContent from "./MenuContent";
import Notification from "../common/Notification";
import user from "../../stores/user";
import CartMobileBottomBar from "../common/cart/CartMobileBottomBar";
import RequiresAuthDialog from "../pages/authentication/RequiresAuthDialog";
import { toolBarHeight } from "../../components/styles/theme";

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
	toolbar: toolBarHeight,
	drawerPaper: {
		width: drawerWidth,
		minHeight: window.innerHeight * 1.1,
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
			mobileOpen: false,
			isWidget: false
		};
	}

	componentDidMount() {
		//This component mounts every time the browser is refreshed, so we need to check we still have a valid token
		user.refreshUser();

		const isWidget = window.location.pathname.includes("/widget/"); //TODO remove this in the future when widgets are in their own react app

		this.setState({ isWidget });
	}

	handleDrawerToggle() {
		this.setState(state => ({ mobileOpen: !state.mobileOpen }));
	}

	render() {
		const { classes, history, children } = this.props;
		const { mobileOpen, isWidget } = this.state;

		const isAuthRoute =
			window.location.pathname.includes("/login") ||
			window.location.pathname.includes("/sign-up"); //TODO might be a better way to do this but new designs require a different container

		//Don't render container things if we're in a widget
		if (isWidget || isAuthRoute) {
			return (
				<div>
					{children}
					<Notification />
				</div>
			);
		}

		const drawer = (
			<MenuContent toggleDrawer={this.handleDrawerToggle.bind(this)} />
		);

		return (
			<div>
				<AppBar
					handleDrawerToggle={this.handleDrawerToggle.bind(this)}
					history={history}
				/>

				<div className={classes.root}>
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
						<RequiresAuthDialog
							onAuthSuccess={() => user.onSuccessAuthRequiredDialog()}
							open={user.showRequiresAuthDialog}
							onClose={() => user.hideAuthRequiredDialog()}
						/>
						<Notification />
					</main>
				</div>
				<CartMobileBottomBar />
			</div>
		);
	}
}

Container.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.element.isRequired
};

export default withStyles(styles)(withRouter(Container));
