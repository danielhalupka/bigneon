import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import user from "../../stores/user";

import { textColorSecondary, primaryHex } from "../../components/styles/theme";

const styles = theme => ({
	menuButton: {
		color: primaryHex
		//marginLeft: -12,
		//marginRight: 0
	},
	rightIcon: {
		marginLeft: theme.spacing.unit,
		marginBottom: 4
	}
});

@observer
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

		const { isAuthenticated, firstName, lastName } = user;

		return (
			<div>
				<Button
					className={classes.menuButton}
					aria-owns={open ? "menu-appbar" : null}
					aria-haspopup="true"
					onClick={this.handleMenu.bind(this)}
					//color="default"
				>
					{isAuthenticated ? `${firstName} ${lastName}` : "Login/Signup"}
					<AccountCircle className={classes.rightIcon} />
				</Button>

				{/* <IconButton
					className={classes.menuButton}
					aria-owns={open ? "menu-appbar" : null}
					aria-haspopup="true"
					onClick={this.handleMenu.bind(this)}
					color="default"
				>
					<AccountCircle />
				</IconButton> */}

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
					{isAuthenticated ? (
						<Link
							to="/profile"
							style={{ textDecoration: "none", outline: "none" }}
						>
							<MenuItem onClick={this.handleClose.bind(this)}>Profile</MenuItem>
						</Link>
					) : null}

					{!isAuthenticated ? (
						<Link
							to="/login"
							style={{ textDecoration: "none", outline: "none" }}
						>
							<MenuItem onClick={this.handleClose.bind(this)}>Login</MenuItem>
						</Link>
					) : null}

					{!isAuthenticated ? (
						<Link
							to="/sign-up"
							style={{ textDecoration: "none", outline: "none" }}
						>
							<MenuItem onClick={this.handleClose.bind(this)}>Sign up</MenuItem>
						</Link>
					) : null}

					{isAuthenticated ? (
						<MenuItem
							onClick={() => {
								user.onLogout();
								this.handleClose();
								this.props.history.push("/login");
							}}
						>
							Logout
						</MenuItem>
					) : null}
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
