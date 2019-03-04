import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Hidden from "@material-ui/core/Hidden";

import user from "../../../stores/user";
import { primaryHex } from "../../styles/theme";
import { toolBarHeight } from "../../styles/theme";

const styles = theme => ({
	root: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		marginRight: theme.spacing.unit * 4,
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
	nameDiv: {
		paddingTop: 4,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	dropdownIcon: {
		marginLeft: theme.spacing.unit,
		height: 10
	}
});

@observer
class CurrentOrganizationMenu extends React.Component {
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

	renderOrgMenu() {
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);
		const { organizationRoles, currentOrganizationId, organizations } = user;

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
				{Object.keys(organizationRoles)
					.sort()
					.map(id => (
						<MenuItem
							key={id}
							onClick={() => {
								user.setCurrentOrganizationRolesAndScopes(id, true);
								this.handleClose();
							}}
							selected={id === currentOrganizationId}
						>
							{organizations[id] || "..."}
						</MenuItem>
					))}
			</Menu>
		);
	}

	render() {
		const { classes } = this.props;
		const { isAuthenticated, currentOrganizationId, organizations } = user;
		if (!isAuthenticated) {
			return null;
		}

		if (!currentOrganizationId) {
			return null;
		}

		return (
			<div className={classes.root}>
				<span
					aria-owns={open ? "menu-appbar" : null}
					aria-haspopup="true"
					onClick={this.handleMenu.bind(this)}
					className={classes.menuButton}
				>
					<Hidden smDown implementation="css">
						<div className={classes.nameDiv}>
							<Typography style={{}} variant="caption">
								Current organization
							</Typography>

							<Typography variant="subheading">
								{organizations[currentOrganizationId] || "..."}
							</Typography>
						</div>
					</Hidden>

					<img
						alt="Organization icon"
						className={classes.dropdownIcon}
						src="/icons/down-active.svg"
					/>
				</span>
				{this.renderOrgMenu()}
			</div>
		);
	}
}

CurrentOrganizationMenu.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CurrentOrganizationMenu);
