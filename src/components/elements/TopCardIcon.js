import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";

const styles = {
	iconDiv: {
		display: "flex",
		justifyContent: "center"
	},
	iconOuter: {
		position: "relative",
		top: 30,
		width: 60,
		height: 60,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)",
		backgroundImage: "linear-gradient(224deg, #e53d96, #5491cc)"
	},
	icon: {
		width: 35,
		height: "auto",
		borderRadius: 0
	}
};

const TopCardIcon = props => {
	const { classes, iconUrl } = props;

	return (
		<div className={classes.iconDiv}>
			<Avatar className={classes.iconOuter}>
				<Avatar alt="Card" src={iconUrl} className={classes.icon}/>
			</Avatar>
		</div>
	);
};

TopCardIcon.propTypes = {
	classes: PropTypes.object.isRequired,
	iconUrl: PropTypes.string.isRequired
};

export default withStyles(styles)(TopCardIcon);
