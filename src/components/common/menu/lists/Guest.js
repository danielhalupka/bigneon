import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import MenuItem from "../../../elements/menu/MenuItem";
import Button from "../../../elements/Button";

const styles = theme => {
	return {
		stats: {
			margin: theme.spacing.unit * 3
		},
		divider: {
			margin: theme.spacing.unit * 3
		},
		spacer: {
			marginTop: theme.spacing.unit
		},
		button: { width: "100%", marginTop: theme.spacing.unit * 2 }
	};
};

const GuestMenuList = observer(props => {
	const { toggleDrawer, openMenuItem, changeOpenMenu, classes } = props;

	return (
		<div>
			<MenuItem to="/help" iconName="fan-hub" onClick={toggleDrawer}>
				Help
			</MenuItem>

			<Divider className={classes.divider} />

			<div className={classes.stats}>
				<Link to="/app">
					<Button
						iconUrl="/icons/phone-white.svg"
						className={classes.button}
						variant="callToAction"
					>
						Get the App
					</Button>
				</Link>
			</div>
		</div>
	);
});

GuestMenuList.propTypes = {
	classes: PropTypes.object.isRequired,
	toggleDrawer: PropTypes.func.isRequired,
	openMenuItem: PropTypes.string,
	changeOpenMenu: PropTypes.func.isRequired
};

export default withStyles(styles)(GuestMenuList);
