import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import user from "../../stores/user";

const styles = {
	menuButton: {
		//marginLeft: -12,
		//marginRight: 0
	}
};

class RightHeaderMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			auth: true,
			anchorEl: null
		};
	}

	handleChange(event, checked) {
		this.setState({ auth: checked });
	}

	handleMenu(event) {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleClose() {
		this.setState({ anchorEl: null });
	}

	render() {
		const { classes } = this.props;
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);

		return (
			<div>
				<IconButton
					className={classes.menuButton}
					aria-owns={open ? "menu-appbar" : null}
					aria-haspopup="true"
					onClick={this.handleMenu.bind(this)}
					color="default"
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
					onClose={this.handleClose.bind(this)}
				>
					<MenuItem onClick={this.handleClose.bind(this)}>Profile</MenuItem>
					<MenuItem onClick={this.handleClose.bind(this)}>My account</MenuItem>
					<MenuItem
						onClick={() => {
							user.onLogout();
							this.handleClose();
							this.props.history.push("/login");
						}}
					>
						Logout
					</MenuItem>
				</Menu>
			</div>
		);
	}
}

RightHeaderMenu.propTypes = {
	classes: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(RightHeaderMenu);
