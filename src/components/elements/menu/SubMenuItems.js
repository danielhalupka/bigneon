import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import SubMenuIcon from "@material-ui/icons/FiberManualRecord";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

const styles = theme => {
	return {
		nested: {
			paddingLeft: theme.spacing.unit * 4
		},
		divider: {
			marginRight: theme.spacing.unit * 3,
			marginLeft: theme.spacing.unit * 3
		},
		text: {
			paddingTop: 3
		}
	};
};

const SubMenuItems = props => {
	const { isExpanded, classes, items, onClick } = props;

	return (
		<Collapse in={isExpanded} timeout="auto" unmountOnExit>
			<List component="div" disablePadding>
				{Object.keys(items).map(label => {
					const to = items[label];
					const active = window.location.pathname === to;

					return (
						<Link key={label} to={to}>
							<ListItem button className={classes.nested} onClick={onClick}>
								{/* <ListItemIcon>
								<SubMenuIcon />
							</ListItemIcon> */}
								<ListItemText
									inset
									disableTypography
									primary={
										<Typography
											className={classes.text}
											variant="body1"
											color={active ? "secondary" : "textSecondary"}
										>
											{label}
										</Typography>
									}
								/>
							</ListItem>
						</Link>
					);
				})}
			</List>
			<Divider className={classes.divider} />
		</Collapse>
	);
};

SubMenuItems.propTypes = {
	classes: PropTypes.object.isRequired,
	isExpanded: PropTypes.bool.isRequired,
	items: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(SubMenuItems);
