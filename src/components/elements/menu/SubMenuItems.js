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

const styles = theme => {
	return {
		nested: {
			paddingLeft: theme.spacing.unit * 4
		},
		divider: {
			marginRight: theme.spacing.unit * 3,
			marginLeft: theme.spacing.unit * 3
		}
	};
};

const SubMenuItems = props => {
	const { isExpanded, classes, items, onClick } = props;

	return (
		<Collapse in={isExpanded} timeout="auto" unmountOnExit>
			<List component="div" disablePadding>
				{Object.keys(items).map(label => (
					<Link key={label} to={items[label]}>
						<ListItem button className={classes.nested} onClick={onClick}>
							<ListItemIcon>
								<SubMenuIcon />
							</ListItemIcon>
							<ListItemText inset primary={label} />
						</ListItem>
					</Link>
				))}
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
