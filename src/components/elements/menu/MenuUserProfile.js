import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

import user from "../../../stores/user";

const styles = theme => {
	return {
		root: {
			display: "flex",
			alignItems: "center",
			flexDirection: "column",
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		avatar: {
			width: 80,
			height: 80,
			marginBottom: theme.spacing.unit * 2,
			backgroundColor: "#EEEEEE"
		},
		divider: {
			marginRight: theme.spacing.unit * 3,
			marginLeft: theme.spacing.unit * 3,
			marginBottom: theme.spacing.unit
		}
	};
};

const MenuUserProfile = observer(props => {
	if (!user.isAuthenticated) {
		return null;
	}
	const { classes, onClick } = props;
	const { firstName, lastName, email, profilePicUrl } = user;

	const fullName = `${firstName} ${lastName}`;
	return (
		<div>
			<Link to="/account" className={classes.root} onClick={onClick}>
				<Avatar
					alt={fullName}
					src={profilePicUrl || "/images/profile-pic-placeholder.png"}
					className={classes.avatar}
					style={{ padding: profilePicUrl ? 0 : 10 }}
				/>

				<Typography variant="title">{fullName}</Typography>
				<Typography variant="caption">{email}</Typography>
			</Link>
			<Divider className={classes.divider}/>
		</div>
	);
});

MenuUserProfile.propTypes = {
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func
};

export default withStyles(styles)(MenuUserProfile);
