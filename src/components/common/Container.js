import React, { Component } from "react";
import PropTypes from "prop-types";

import Header from "./Header";
import SideDrawer from "./SideDrawer";
import { withStyles } from "@material-ui/core";

const styles = theme => ({
	appFrame: {
		height: "100%",
		zIndex: 1,
		overflow: "hidden",
		position: "relative",
		display: "flex",
		width: "100%"
	},
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3
	}
});

class Container extends Component {
	constructor(props) {
		super(props);

		this.state = {
			openMenu: true
		};
	}

	render() {
		const { children, classes } = this.props;
		const { openMenu } = this.state;

		return (
			<div>
				<Header
					onMenuButtonClick={() => this.setState({ openMenu: !openMenu })}
				/>
				<div className={classes.appFrame}>
					<SideDrawer openMenu={openMenu} />
					<main className={classes.content}>{children}</main>
				</div>
			</div>
		);
	}
}

Container.propTypes = {
	children: PropTypes.element.isRequired
};

export default withStyles(styles)(Container);
