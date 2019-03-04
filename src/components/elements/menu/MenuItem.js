import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import classnames from "classnames";

const styles = theme => {
	return {
		listItem: {
			borderLeft: "solid",
			borderWidth: 2,
			borderColor: "transparent"
		},
		activeListItem: {
			borderLeft: "solid",
			borderWidth: 2,
			borderColor: theme.palette.secondary.main
		},
		iconContainer: {},
		shortLayoutContainer: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center"
		},
		icon: { width: 28, height: 28 },
		text: { paddingTop: 3, textTransform: "capitalize" },
		textSmall: {
			fontSize: theme.typography.fontSize * 0.7,
			textAlign: "center"
		},
		expandIcon: { color: theme.palette.grey[500], width: 22, height: 22 }
	};
};

const MenuItem = props => {
	const {
		to,
		children,
		iconName,
		onClick,
		expand,
		shortLayout,
		classes
	} = props;
	const active = window.location.pathname === to;
	const iconUrl = `/icons/${iconName}-${active ? "active" : "gray"}.svg`;

	let expandIcon = null;
	if (expand === true) {
		expandIcon = <ExpandLess className={classes.expandIcon}/>;
	} else if (expand === false) {
		expandIcon = <ExpandMore className={classes.expandIcon}/>;
	}

	let listItem;

	if (shortLayout) {
		listItem = (
			<ListItem
				button
				onClick={onClick}
				className={classnames({
					[classes.shortLayoutContainer]: true,
					[classes.activeListItem]: active,
					[classes.listItem]: !active
				})}
			>
				<img alt={children} src={iconUrl} className={classes.icon}/>

				<Typography
					className={classes.textSmall}
					color={active ? "secondary" : "textSecondary"}
				>
					{children}
				</Typography>
			</ListItem>
		);
	} else {
		listItem = (
			<ListItem
				button
				onClick={onClick}
				className={active ? classes.activeListItem : classes.listItem}
			>
				<ListItemIcon className={classes.iconContainer}>
					<img alt={children} src={iconUrl} className={classes.icon}/>
				</ListItemIcon>

				<ListItemText
					inset
					disableTypography
					primary={(
						<Typography
							className={classes.text}
							color={active ? "secondary" : "textSecondary"}
						>
							{children}
						</Typography>)}
				/>
				{expandIcon}
			</ListItem>
		);
	}

	if (to) {
		return <Link to={to}>{listItem}</Link>;
	}

	return listItem;
};

MenuItem.propTypes = {
	classes: PropTypes.object.isRequired,
	to: PropTypes.string,
	children: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	expand: PropTypes.bool,
	iconName: PropTypes.string.isRequired,
	shortLayout: PropTypes.bool
};

export default withStyles(styles)(MenuItem);
