import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import moment from "moment-timezone";
import { Link } from "react-router-dom";

import { fontFamilyDemiBold, secondaryHex } from "../../../../config/theme";
import ColorTag from "../../../elements/ColorTag";
import Card from "../../../elements/Card";
import HorizontalBreakdownBar from "../../../elements/charts/HorizontalBreakdownBar";
import TicketTypeSalesBarChart from "../../../elements/charts/TicketTypeSalesBarChart";
import DateFlag from "../../../elements/event/DateFlag";

const styles = theme => {
	return {
		media: {
			minHeight: 250,
			height: "100%",
			width: "100%",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			paddingLeft: theme.spacing.unit * 2
		},
		eventDetailsContainer: {
			paddingLeft: theme.spacing.unit * 2,
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between"
		},
		topRow: {
			display: "flex",
			justifyContent: "space-between",
			paddingRight: theme.spacing.unit
		},
		eventName: {
			paddingTop: theme.spacing.unit * 2,
			textTransform: "capitalize",
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 1.6
		},
		venueName: {
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold
		},
		eventDate: {
			color: "#9DA3B4"
		},
		totalsContainer: {
			display: "flex",
			justifyContent: "flex-start"
		},
		totalsDivider: {
			borderLeft: "1px solid",
			borderColor: "#9da3b4",
			opacity: 0.5,
			marginRight: theme.spacing.unit * 2,
			marginLeft: theme.spacing.unit * 2
		},
		totalHeading: {
			fontSize: theme.typography.fontSize * 0.9
		},
		totalValue: {
			fontSize: theme.typography.fontSize
		},
		statusContainer: {
			display: "flex"
		},
		bottomPadding: {
			paddingBottom: theme.spacing.unit * 2
		},
		progressBarContainer: {
			display: "flex",
			paddingRight: theme.spacing.unit * 2
		},
		expandIconRow: {
			display: "flex",
			justifyContent: "center",
			cursor: "pointer",
			paddingBottom: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 2
		},
		expandIconRowPlaceholder: {
			display: "flex",
			justifyContent: "center",
			paddingBottom: theme.spacing.unit * 2,
			paddingTop: theme.spacing.unit * 2
		},
		expandedViewContent: {
			paddingTop: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 3,
			paddingLeft: theme.spacing.unit * 3
		}
	};
};

const Total = ({ children, color, value, classes }) => (
	<div>
		<Typography className={classes.totalHeading} style={{ color }}>
			{children}
		</Typography>
		<Typography className={classes.totalValue}>{value}</Typography>
	</div>
);

const EventSummaryCard = props => {
	const {
		classes,
		id,
		imageUrl,
		name,
		isExternal,
		venueName,
		menuButton,
		isPublished,
		isOnSale,
		eventDate,
		totalSold,
		totalOpen,
		totalHeld,
		totalCapacity,
		totalSalesInCents,
		isExpanded,
		onExpandClick,
		ticketTypes,
		cancelled,
		eventEnded
	} = props;

	const mediaStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};

	const displayEventStartDate = eventDate.format(
		"dddd, MMMM Do YYYY h:mm A"
	);

	let tags = null;
	if (cancelled) {
		tags = (
			<Typography className={classes.cancelled}>
				Cancelled
			</Typography>
		);
	} else {
		let onSaleTag = null;

		if (eventEnded) {
			onSaleTag = (
				<ColorTag variant="disabled">Event ended</ColorTag>
			);
		} else if (isOnSale) {
			onSaleTag = (
				<ColorTag variant="green">On sale</ColorTag>
			);
		} else if (isExternal) {
			onSaleTag = (
				<ColorTag variant="green">External</ColorTag>
			);
		}

		tags = (
			<div className={classes.statusContainer}>
				<ColorTag
					style={{ marginRight: 10 }}
					variant={isPublished ? "default" : "disabled"}
				>
					{isPublished ? "Published" : "Draft"}
				</ColorTag>
				{onSaleTag}
			</div>
		);
	}

	return (
		<Card variant="block">
			<Grid container spacing={0}>
				<Grid item xs={12} sm={5} lg={4}>
					<Link to={`/admin/events/${id}/dashboard`}>
						<div className={classes.media} style={mediaStyle}>
							{eventDate ? <DateFlag date={eventDate} size="medium"/> : null}
						</div>
					</Link>
				</Grid>

				<Grid item xs={12} sm={7} lg={8} className={classes.eventDetailsContainer}>
					<div className={classes.topRow}>
						<div className={classes.bottomPadding}>
							<Link to={`/admin/events/${id}/dashboard`}>
								<Typography className={classes.eventName}>
									{name}
								</Typography>
							</Link>
							<Typography className={classes.venueName}>
								{venueName}
							</Typography>
							<Typography className={classes.eventDate}>
								{displayEventStartDate}
							</Typography>
						</div>
						<div>{menuButton}</div>
					</div>
					<Grid container spacing={0} alignItems="center">
						<Grid item xs={12} sm={12} md={5} lg={5} className={classes.bottomPadding}>
							{tags}
						</Grid>

						<Grid item xs={12} sm={12} md={7} lg={7} className={classes.bottomPadding}>
							{!isExternal ?
								(
									<div className={classes.totalsContainer}>
										<Total classes={classes} value={totalSold} color={"#707ced"}>
											Sold
										</Total>

										<div className={classes.totalsDivider}/>

										<Total classes={classes} value={totalOpen} color={"#afc6d4"}>
											Open
										</Total>

										<div className={classes.totalsDivider}/>

										<Total classes={classes} value={totalHeld} color={"#ff22b2"}>
											Held
										</Total>

										<div className={classes.totalsDivider}/>

										<Total classes={classes} value={totalCapacity}>
											Capacity
										</Total>

										<div className={classes.totalsDivider}/>

										<Total classes={classes} value={`$${(totalSalesInCents / 100).toFixed(2)}`}>
											Sales
										</Total>
									</div>
								) :
								(
									<div className={classes.totalsContainer}>
										<Typography variant="caption">Externally Ticketed</Typography>
									</div>
								)
							}
						</Grid>

					</Grid>
					<div>
						{!isExternal ? (
							<div className={classes.progressBarContainer}>
								<HorizontalBreakdownBar
									title="Ticket progress"
									values={[
										{ label: "Tickets sold", value: totalSold },
										{ label: "Tickets open", value: totalOpen },
										{ label: "Tickets held", value: totalHeld }
									]}
								/>
							</div>
						) : null}
						{isExternal ?
							<div className={classes.expandIconRowPlaceholder}>&nbsp;</div> :
							(
								!isExpanded
									?
									(
										<div
											className={classes.expandIconRow}
											onClick={() => onExpandClick(id)}
										>
											<img src={"/icons/down-active.svg"}/>
										</div>
									) :
									(
										<div className={classes.expandIconRowPlaceholder}>&nbsp;</div>
									)
							)
						}
					</div>
				</Grid>

				<Grid item xs={12} sm={12} lg={12}>
					<Collapse in={isExpanded}>
						<div className={classes.expandedViewContent}>
							<Grid container spacing={32}>
								{ticketTypes.map((ticketType, index) => {
									const remainingHeld = ticketType.held - ticketType.sold_held;
									// const valueDisplay = ticketType.held > 0 ? `${remainingHeld} / ${ticketType.held}` : "";
									return (
										<Grid key={index} item xs={12} sm={12} md={6} lg={4}>
											<TicketTypeSalesBarChart
												name={ticketType.name}
												totalRevenueInCents={ticketType.sales_total_in_cents}
												values={[
													{
														label: "Sold",
														value: ticketType.sold_held + ticketType.sold_unreserved
													},
													{ label: "Open", value: ticketType.open },
													{ label: "Held", value: remainingHeld }
												]}
											/>
										</Grid>
									);
								})}
							</Grid>
							<div
								className={classes.expandIconRow}
								onClick={() => onExpandClick(null)}
							>
								<img src={"/icons/up-active.svg"}/>
							</div>
						</div>
					</Collapse>
				</Grid>
			</Grid>
		</Card>
	);
};

EventSummaryCard.propTypes = {
	classes: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	imageUrl: PropTypes.string,
	name: PropTypes.string.isRequired,
	venueName: PropTypes.string.isRequired,
	eventDate: PropTypes.object.isRequired,
	menuButton: PropTypes.element.isRequired,
	isPublished: PropTypes.bool.isRequired,
	isOnSale: PropTypes.bool.isRequired,
	totalSold: PropTypes.number.isRequired,
	totalOpen: PropTypes.number.isRequired,
	totalHeld: PropTypes.number.isRequired,
	totalCapacity: PropTypes.number.isRequired,
	totalSalesInCents: PropTypes.number.isRequired,
	isExpanded: PropTypes.bool.isRequired,
	onExpandClick: PropTypes.func.isRequired,
	ticketTypes: PropTypes.array.isRequired,
	cancelled: PropTypes.bool,
	eventEnded: PropTypes.bool
};

export default withStyles(styles)(EventSummaryCard);
