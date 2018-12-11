import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";

import user from "../../../stores/user";
import { toolBarHeight } from "../../styles/theme";
import layout from "../../../stores/layout";

const styles = theme => ({
	root: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		marginRight: theme.spacing.unit * 4,
		...toolBarHeight
	},
	textDiv: {
		paddingTop: 4,
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	icon: {
		marginRight: theme.spacing.unit,
		height: "100%"
	}
});

const BoxOfficeLink = observer(({ classes }) => {
	const { isBoxOffice } = layout;

	//Check they have access to box office
	if (!user.isOrgBoxOffice) {
		return null;
	}

	return (
		<Link to={isBoxOffice ? "/admin/events" : "/box-office/sell"}>
			<div className={classes.root}>
				<img
					alt="Box office icon"
					className={classes.icon}
					src="/icons/tickets-multi.svg"
				/>

				<Hidden smDown implementation="css">
					<div className={classes.textDiv}>
						<Typography style={{}} variant="caption">
							{isBoxOffice ? "Return to" : "Visit"}
						</Typography>

						<Typography variant="subheading">
							{isBoxOffice ? "Studio" : "Box office"}
						</Typography>
					</div>
				</Hidden>
			</div>
		</Link>
	);
});

BoxOfficeLink.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BoxOfficeLink);
