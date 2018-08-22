import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Warning from "@material-ui/icons/Warning";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import user from "../../stores/user";
import NotificationList from "../common/NotificationList";
import { primaryHex } from "../../components/styles/theme";
import { Hidden } from "@material-ui/core";

const styles = theme => ({
	menuButton: {
		color: primaryHex,
		boxShadow: "0 2px 2px 0px rgba(1, 1, 1, 0)"
	},
	rightIcon: {
		marginRight: theme.spacing.unit,
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

	renderDevelopmentErrors() {
		const { classes } = this.props;
		const isProduction = process.env.NODE_ENV === "production";
		if (!isProduction) {
			const checkEnvKeys = [
				"REACT_APP_API_PROTOCOL",
				"REACT_APP_API_HOST",
				"REACT_APP_API_PORT",
				"REACT_APP_FACEBOOK_APP_ID",
				"REACT_APP_GOOGLE_PLACES_API_KEY"
			];
			let items = [];
			checkEnvKeys.forEach(key => {
				if (!process.env.hasOwnProperty(key)) {
					items.push(`${key}`);
				}
			});
			if (items.length) {
				items.unshift("Missing Environment keys");
				return (
					<NotificationList
						icon={<Warning />}
						items={items}
						classes={classes}
						color={"secondary"}
					/>
				);
			}
		}
		return null;
	}

	render() {
		const { classes } = this.props;
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);

		const { isAuthenticated, firstName, lastName } = user;

		const isProduction = process.env.NODE_ENV === "production";

		return (
			<div>
				{this.renderDevelopmentErrors()}
				{isAuthenticated !== null ? (
					<Button
						className={classes.menuButton}
						aria-owns={open ? "menu-appbar" : null}
						aria-haspopup="true"
						onClick={this.handleMenu.bind(this)}
					>
						<AccountCircle className={classes.rightIcon} />

						{isAuthenticated ? (
							<span>
								Hi,&nbsp;
								{firstName}
							</span>
						) : (
							"Login/Signup"
						)}
					</Button>
				) : null}

				<Hidden smDown>
					<Link to="/help" style={{ textDecoration: "none" }}>
						<Button className={classes.menuButton}>Help</Button>
					</Link>
				</Hidden>

				<Hidden smDown>
					<Link to="/app" style={{ textDecoration: "none" }}>
						<Button variant="contained" color="primary">
							Get the app
						</Button>
					</Link>
				</Hidden>

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
