import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Warning from "@material-ui/icons/Warning";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import user from "../../../stores/user";
import NotificationList from "../../common/NotificationList";
import { primaryHex } from "../../styles/theme";
import { toolBarHeight } from "../../styles/theme";
import Button from "../Button";

const styles = theme => ({
	root: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		...toolBarHeight
	},
	menuButton: {
		color: primaryHex,
		boxShadow: "0 2px 2px 0px rgba(1, 1, 1, 0)",
		cursor: "pointer",
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},
	avatar: {
		marginRight: theme.spacing.unit * 2
	},
	dropdownIcon: {
		marginLeft: theme.spacing.unit * 2,
		height: 10
	},
	menuLink: {
		outline: "none",
		marginLeft: theme.spacing.unit * 2
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
				"REACT_APP_GOOGLE_PLACES_API_KEY",
				"REACT_APP_CLOUDINARY_CLOUD_NAME",
				"REACT_APP_CLOUDINARY_UPLOAD_PRESET",
				"REACT_APP_CLOUDINARY_API_KEY",
				"REACT_APP_STRIPE_API_KEY"
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
					/>
				);
			}
		}
		return null;
	}

	renderUserMenu() {
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);

		return (
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
				<Link to="/account">
					<MenuItem onClick={this.handleClose.bind(this)}>Account</MenuItem>
				</Link>

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
		);
	}

	renderAuthenticated() {
		const { classes } = this.props;
		const { firstName, lastName, profilePicUrl } = user;

		return (
			<span
				aria-owns={open ? "menu-appbar" : null}
				aria-haspopup="true"
				onClick={this.handleMenu.bind(this)}
				className={classes.menuButton}
			>
				<Avatar
					alt={firstName}
					src={profilePicUrl}
					className={classes.avatar}
				/>

				<span>
					<Typography style={{ paddingTop: 4 }} variant="caption">
						Welcome back
					</Typography>
					<Typography variant="subheading">
						{firstName}
						&nbsp;
						{lastName}
					</Typography>
				</span>

				<img
					alt="Search icon"
					className={classes.dropdownIcon}
					src="/icons/arrow-down.svg"
				/>
			</span>
		);
	}

	renderUnAuthenticated() {
		const { classes } = this.props;

		return (
			<span className={classes.menuButton} style={{ paddingTop: 4 }}>
				<Link to="/login" className={classes.menuLink}>
					<Typography variant="subheading">Sign In</Typography>
				</Link>

				<Link to="/help" className={classes.menuLink}>
					<Typography variant="subheading">help</Typography>
				</Link>

				<Link to="/help" className={classes.menuLink}>
					<Button size="large" variant="callToAction">
						Get the App
					</Button>
				</Link>
			</span>
		);
	}

	render() {
		const { classes } = this.props;
		const { isAuthenticated } = user;

		return (
			<div className={classes.root}>
				{this.renderDevelopmentErrors()}

				{isAuthenticated === true ? this.renderAuthenticated() : null}
				{isAuthenticated === false ? this.renderUnAuthenticated() : null}

				{this.renderUserMenu()}
			</div>
		);
	}
}

RightHeaderMenu.propTypes = {
	classes: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(RightHeaderMenu);
