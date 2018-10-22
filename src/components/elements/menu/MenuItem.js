import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

const styles = theme => {
	return {};
};

const UserMenuDetails = props => {
	const { to, children, icon, onClick, expandIcon } = props;

	const listItem = (
		<ListItem button onClick={onClick}>
			<ListItemIcon>{icon}</ListItemIcon>
			<ListItemText inset primary={children} />
			{expandIcon}
		</ListItem>
	);

	if (to) {
		return <Link to={to}>{listItem}</Link>;
	}

	return listItem;
};

UserMenuDetails.propTypes = {
	classes: PropTypes.object.isRequired,
	to: PropTypes.string,
	children: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	expandIcon: PropTypes.element
};

export default withStyles(styles)(UserMenuDetails);
