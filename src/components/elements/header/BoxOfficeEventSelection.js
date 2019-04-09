import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import moment from "moment";

import user from "../../../stores/user";
import { primaryHex, fontFamilyDemiBold } from "../../../config/theme";
import { toolBarHeight } from "../../../config/theme";
import boxOffice from "../../../stores/boxOffice";

const displayTime = ({ event_start, door_time }) => {
	const displayDate = moment(event_start).format("ddd, D MMM YYYY");
	const displayDoorTime = moment(door_time).format("hh:mm A");
	const displayShowTime = moment(event_start).format("hh:mm A");

	return `${displayDate}, Doors ${displayDoorTime} - Show ${displayShowTime}`;
};

const styles = theme => ({
	headerRoot: {
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
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "flex-end"
	},
	dropdownIcon: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		marginBottom: 2,
		height: 10
	},
	heading: {
		fontFamily: fontFamilyDemiBold
	},
	subHeading: {
		//fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.8,
		color: "#9DA3B4",
		lineHeight: 1
	},
	promoImage: {
		marginLeft: theme.spacing.unit * 2,
		height: 40,
		width: 40,
		borderRadius: 4,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center"
	},
	//Standalone classes
	standaloneSpacer: {
		...toolBarHeight
	},
	standaloneRoot: {
		backgroundColor: "#FFFFFF",
		height: 70,
		display: "flex",
		justifyContent: "center",
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	standaloneMenuButton: {
		color: primaryHex,
		boxShadow: "0 2px 2px 0px rgba(1, 1, 1, 0)",
		cursor: "pointer",
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},
	standalonePromoImageContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flex: 1
	},
	standalonePromoImage: {
		height: 40,
		width: 40,
		borderRadius: 4,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		marginRight: theme.spacing.unit
	},
	standAloneNameDiv: {
		flex: 5,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	standaloneDropdownIcon: {
		marginLeft: theme.spacing.unit,
		height: 10
	}
});

@observer
class BoxOfficeEventSelection extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			auth: true,
			anchorEl: null
		};
	}

	componentDidMount() {
		boxOffice.refreshEvents();
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

	renderEventsMenu() {
		const { anchorEl } = this.state;
		const { classes } = this.props;
		const open = Boolean(anchorEl);
		const { availableEvents, activeEventId } = boxOffice;

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
				{availableEvents.map(
					({ id, name, promo_image_url, venue, event_start, door_time, status }) => {
						//TODO use localised times in event obj
						const displayTimes = {
							event_start: moment.utc(event_start).local(),
							door_time: moment.utc(door_time || event_start).local()
						};
						if (venue.timezone) {
							displayTimes.event_start = moment.utc(event_start).tz(venue.timezone);
							displayTimes.door_time = moment.utc(door_time || event_start).tz(venue.timezone);
						}
						return (
							<MenuItem
								key={id}
								onClick={() => {
									boxOffice.setActiveEventId(id, true);
									this.handleClose();
								}}
								selected={id === activeEventId}
								style={{ opacity: status === "Draft" ? 0.5 : 1 }}
							>
								<ListItemIcon>
									<div
										className={classes.promoImage}
										style={{
											backgroundImage: `url(${promo_image_url ||
											"/images/app-promo-background.png"})`
										}}
									/>
								</ListItemIcon>
								<ListItemText
									inset
									primary={name}
									secondary={` ${venue.name} - ${displayTime(displayTimes)}`}
								/>
							</MenuItem>
						);
					}
				)}
			</Menu>
		);
	}

	render() {
		const { classes, type } = this.props;
		const { isAuthenticated } = user;
		if (!isAuthenticated) {
			return null;
		}

		const { activeEventDetails } = boxOffice;
		if (!activeEventDetails) {
			return null;
		}

		const {
			name,
			event_start,
			door_time,
			promo_image_url,
			venue,
			status,
			publish_date
		} = activeEventDetails;
		const displayTimes = {
			event_start: moment.utc(event_start).local(),
			door_time: moment.utc(door_time || event_start).local()
		};
		if (venue.timezone) {
			displayTimes.event_start = moment.utc(event_start).tz(venue.timezone);
			displayTimes.door_time = moment.utc(door_time || event_start).tz(venue.timezone);
		}

		const publishIsInFuture = moment.utc(publish_date) > moment.utc();
		const invalidStatus = status === "Draft" ? "(Un-Published)" : publishIsInFuture ? "(Pre-Published)" : "";

		if (type === "top-bar") {
			return (
				<div className={classes.headerRoot}>
					<span
						aria-owns={open ? "menu-appbar" : null}
						aria-haspopup="true"
						onClick={this.handleMenu.bind(this)}
						className={classes.menuButton}
					>
						<div
							className={classes.promoImage}
							style={{
								backgroundImage: `url(${promo_image_url ||
							"/images/app-promo-background.png"})`
							}}
						/>
						<div className={classes.nameDiv}>
							<div>
								<Typography className={classes.heading}>
									{name}
									<span style={{ flex: 1 }}/>
									<sup>{invalidStatus}</sup>
								</Typography>
								<Typography className={classes.subHeading}>
									{venue.name} - {displayTime(displayTimes)}
								</Typography>
							</div>
							<img
								alt="Events icon"
								className={classes.dropdownIcon}
								src="/icons/down-active.svg"
							/>
						</div>
					</span>
					{this.renderEventsMenu()}
				</div>
			);
		}

		if (type === "stand-alone") {
			return (
				<div>
					<div className={classes.standaloneSpacer}/>
					<div className={classes.standaloneRoot}>
						<span
							aria-owns={open ? "menu-appbar" : null}
							aria-haspopup="true"
							onClick={this.handleMenu.bind(this)}
							className={classes.standaloneMenuButton}
						>
							<div className={classes.standalonePromoImageContainer}>
								<div
									className={classes.standalonePromoImage}
									style={{
										backgroundImage: `url(${promo_image_url || "/images/app-promo-background.png"})`
									}}
								/>
							</div>
							<div className={classes.standAloneNameDiv}>
								<div>
									<Typography className={classes.heading}>
										{name}
										<span style={{ flex: 1 }}/>
										<sup>{invalidStatus}</sup>
									</Typography>
									<Typography className={classes.subHeading}>
										{venue.name} - {displayTime(displayTimes)}
									</Typography>
								</div>
								<img
									alt="Events icon"
									className={classes.standaloneDropdownIcon}
									src="/icons/down-active.svg"
								/>
							</div>
						</span>
						{this.renderEventsMenu()}
					</div>
				</div>
			);
		}

		return null;
	}
}

BoxOfficeEventSelection.propTypes = {
	classes: PropTypes.object.isRequired,
	type: PropTypes.oneOf(["top-bar", "stand-alone"]).isRequired
};

export default withStyles(styles)(BoxOfficeEventSelection);
