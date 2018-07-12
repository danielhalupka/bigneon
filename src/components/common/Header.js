import React, { Component } from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";

import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

class Header extends Component {
	state = {
		auth: true,
		anchorEl: null
	};

	handleChange = (event, checked) => {
		this.setState({ auth: checked });
	};

	handleMenu = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleClose = () => {
		this.setState({ anchorEl: null });
	};

	render() {
		const { onMenuButtonClick, classes } = this.props;

		const { auth, anchorEl } = this.state;
		const open = Boolean(anchorEl);

		return (
			<AppBar position="static">
				<Toolbar>
					<div style={{ flex: 1 }}>
						<img src="/images/bn-logo-light-text.png" />
					</div>

					<div />
					<div>
						<IconButton
							aria-owns={open ? "menu-appbar" : null}
							aria-haspopup="true"
							onClick={this.handleMenu}
							color="inherit"
						>
							<AccountCircle />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: "top",
								horizontal: "right"
							}}
							transformOrigin={{
								vertical: "top",
								horizontal: "right"
							}}
							open={open}
							onClose={this.handleClose}
						>
							<MenuItem onClick={this.handleClose}>Profile</MenuItem>
							<MenuItem onClick={this.handleClose}>My account</MenuItem>
						</Menu>
					</div>
				</Toolbar>
			</AppBar>
		);
	}
}

Header.propTypes = {
	onMenuButtonClick: PropTypes.func.isRequired
};

export default Header;
