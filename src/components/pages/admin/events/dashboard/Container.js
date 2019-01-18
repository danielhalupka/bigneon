import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Link } from "react-router-dom";
import moment from "moment";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import PageHeading from "../../../../elements/PageHeading";
import Card from "../../../../elements/Card";
import Button from "../../../../elements/Button";
import CheckBox from "../../../../elements/form/CheckBox";
import StyledLink from "../../../../elements/StyledLink";
import Divider from "../../../../common/Divider";
import user from "../../../../../stores/user";

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

const isActiveReportMenu = type =>
	(window.location.pathname || "").endsWith(type);

@observer
class EventDashboardContainer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			event: null,
			anchorToolsEl: null,
			anchorReportsEl: null
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.props.eventId);
	}

	handleToolsMenu(event) {
		this.setState({ anchorToolsEl: event.currentTarget });
	}

	handleReportsMenu(event) {
		this.setState({ anchorReportsEl: event.currentTarget });
	}

	handleToolsMenuClose() {
		this.setState({ anchorToolsEl: null });
	}

	handleReportsMenuClose() {
		this.setState({ anchorReportsEl: null });
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
		const { anchorToolsEl } = this.state;
		const open = Boolean(anchorToolsEl);
		const { event } = this.state;

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorToolsEl}
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
				<a href={`/exports/events/${event.id}/guests`} target="_blank">
					<MenuItem onClick={this.handleToolsMenuClose.bind(this)}>
						Export guest list
					</MenuItem>
				</a>
			</Menu>
		);
	}

	renderReportsMenu() {
		const { anchorReportsEl } = this.state;
		const open = Boolean(anchorReportsEl);
		const { event } = this.state;

		const {
			hasTransactionReports,
			hasEventSummaryReports,
			hasTicketCountReports
		} = user;
		const items = [];

		if (hasEventSummaryReports) {
			items.push(
				<Link
					key="summary"
					to={`/admin/events/${event.id}/dashboard/reports/summary`}
				>
					<MenuItem
						selected={isActiveReportMenu("summary")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Event summary
					</MenuItem>
				</Link>
			);
		}

		if (hasTransactionReports) {
			items.push(
				<Link
					key="tx"
					to={`/admin/events/${event.id}/dashboard/reports/transactions`}
				>
					<MenuItem
						selected={isActiveReportMenu("transactions")}
						onClick={this.handleReportsMenuClose.bind(this)}
					>
						Transaction details
					</MenuItem>
				</Link>
			);
		}

		if (hasTicketCountReports) {
			items.push(
				<Link
					key="ticket-counts"
					to={`/admin/events/${event.id}/dashboard/reports/ticket-counts`}
				>
					<MenuItem selected={isActiveReportMenu("ticket-counts")}
							  onClick={this.handleReportsMenuClose.bind(this)}
					>
						Ticket counts
					</MenuItem>
				</Link>
			);
		}

		if (items.length === 0) {
			items.push(
				<MenuItem key="none" onClick={this.handleReportsMenuClose.bind(this)}>
					No reports available
				</MenuItem>
			);
		}

		return (
			<Menu
				id="menu-appbar"
				anchorEl={anchorReportsEl}
				anchorOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right"
				}}
				open={open}
				onClose={this.handleReportsMenuClose.bind(this)}
			>
				{items}
			</Menu>
		);
	}

	render() {
		const { event } = this.state;
		const { classes, children, subheading } = this.props;

		if (!event) {
			return <Typography>Loading...</Typography>;
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
								{event.is_external ? null : (
									<Typography className={classes.menuText}>
										{this.renderToolsMenu()}
										<StyledLink
											underlined={subheading === "tools"}
											onClick={this.handleToolsMenu.bind(this)}
										>
											Tools
										</StyledLink>
									</Typography>
								)}
								{event.is_external ? null : (
									<Typography className={classes.menuText}>
										{this.renderReportsMenu()}
										<StyledLink
											underlined={subheading === "reports"}
											onClick={this.handleReportsMenu.bind(this)}
										>
											Reports
										</StyledLink>
									</Typography>
								)}
							</div>
						</div>
						<Divider style={{ marginBottom: 10 }}/>

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
