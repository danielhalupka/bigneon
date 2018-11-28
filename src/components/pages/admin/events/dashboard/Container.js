import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Link } from "react-router-dom";
import moment from "moment";
import PropTypes from "prop-types";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import PageHeading from "../../../../elements/PageHeading";
import Card from "../../../../elements/Card";
import Button from "../../../../elements/Button";
import CheckBox from "../../../../elements/form/CheckBox";
import StyledLink from "../../../../elements/StyledLink";
import Divider from "../../../../common/Divider";

const styles = theme => ({
	rightHeaderOptions: {
		display: "flex",
		justifyContent: "flex-end",
		alignContent: "center"
	},
	innerCard: {
		padding: theme.spacing.unit * 5
	},
	headerContainer: { marginBottom: theme.spacing.unit * 4 },
	menuContainer: {
		display: "flex"
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	}
});

class EventDashboardContainer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			event: null,
			anchorEl: null
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.props.eventId);
	}

	handleToolsMenu(event) {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleToolsMenuClose() {
		this.setState({ anchorEl: null });
	}

	loadEventDetails(eventId) {
		Bigneon()
			.events.dashboard({ id: eventId })
			.then(response => {
				const { last_30_days, event } = response.data;

				this.setState({
					event
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Loading event details failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	renderToolsMenu() {
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);
		const { event } = this.state;

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
				onClose={this.handleToolsMenuClose.bind(this)}
			>
				<Link to={`/admin/events/${event.id}/dashboard/holds`}>
					<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
						Smart holds
					</MenuItem>
				</Link>
			</Menu>
		);
	}

	render() {
		const { event } = this.state;
		const { classes, children, subheading } = this.props;

		if (!event) {
			return <Typography>Loading...</Typography>; //TODO get a spinner or something
		}

		const isPublished = moment(event.publish_date) < moment();
		const isOnSale = moment(event.on_sale) < moment();

		return (
			<div>
				<Grid container>
					<Grid item xs={12} sm={12} lg={6}>
						<PageHeading iconUrl="/icons/events-multi.svg">
							{event.name}
						</PageHeading>
					</Grid>
					<Grid
						item
						xs={6}
						sm={6}
						lg={6}
						className={classes.rightHeaderOptions}
					>
						<div>
							<CheckBox style={{ cursor: "text" }} active={isPublished}>
								Published
							</CheckBox>
							<CheckBox style={{ cursor: "text" }} active={isOnSale}>
								On sale
							</CheckBox>
						</div>
						<Link to={`/admin/events/${event.id}/edit`}>
							<Button variant="callToAction">Edit event</Button>
						</Link>
					</Grid>
				</Grid>

				<Card>
					<div className={classes.innerCard}>
						<div className={classes.headerContainer}>
							<div className={classes.menuContainer}>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={subheading === "summary"}
										to={`/admin/events/${event.id}/dashboard`}
									>
										Dashboard
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									{this.renderToolsMenu()}
									<StyledLink
										underlined={subheading === "tools"}
										//to={`/admin/events/${event.id}/dashboard/tools`}
										onClick={this.handleToolsMenu.bind(this)}
									>
										Tools
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={subheading === "sales"}
										//to={`/admin/events/${event.id}/dashboard/sales`}
										onClick={() =>
											notifications.show({ message: "Coming soon." })
										}
									>
										Sales
									</StyledLink>
								</Typography>
								<Typography className={classes.menuText}>
									<StyledLink
										underlined={subheading === "reports"}
										//to={`/admin/events/${event.id}/dashboard/reports`}
										onClick={() =>
											notifications.show({ message: "Coming soon." })
										}
									>
										Reports
									</StyledLink>
								</Typography>
							</div>
						</div>
						<Divider style={{ marginBottom: 40 }} />

						{children}
					</div>
				</Card>
			</div>
		);
	}
}

EventDashboardContainer.propTypes = {
	classes: PropTypes.object.isRequired,
	eventId: PropTypes.string.isRequired,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
		.isRequired,
	subheading: PropTypes.string.isRequired
};

export default withStyles(styles)(EventDashboardContainer);
