import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";

import { fontFamilyDemiBold } from "../../../styles/theme";
import CheckBox from "../../../elements/form/CheckBox";
import Card from "../../../elements/Card";
import HorizontalBreakdownBar from "../../../elements/charts/HorizontalBreakdownBar";
import TicketTypeSalesBarChart from "../../../elements/charts/TicketTypeSalesBarChart";

const styles = theme => {
	return {
		root: {},
		simpleViewContent: {
			flex: 1,
			height: 250,
			display: "flex"
		},
		expandedViewContent: {
			paddingTop: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 3,
			paddingLeft: theme.spacing.unit * 3
		},
		media: {
			flex: 1,
			height: "100%",
			width: "100%"
		},
		mediaPlaceholder: {
			flex: 1,
			height: "100%",
			width: "100%",
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)"
		},
		details: {
			flex: 2,
			padding: theme.spacing.unit * 3,
			paddingBottom: 0,
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between"
		},
		row1: {
			display: "flex",
			alignItems: "flex-start",
			justifyContent: "space-between"
		},
		row2: {
			display: "flex",
			justifyContent: "space-between"
		},
		row3: {
			display: "flex"
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
		eventName: {
			color: theme.typography.headline.color,
			textTransform: "capitalize",
			fontFamily: fontFamilyDemiBold
		},
		venueName: {
			color: theme.typography.headline.color,
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold
		},
		statuses: {
			display: "flex",
			justifyContent: "flex-start",
			flex: 2
		},
		totalsContainer: {
			flex: 3,
			display: "flex",
			justifyContent: "flex-end"
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
		menuButton,
		isPublished,
		isOnSale,
		eventDate,
		totalSold,
		totalOpen,
		totalHeld,
		totalCapacity,
		totalSales,
		isExpanded,
		onExpandClick,
		ticketTypes
	} = props;

	return (
		<Card variant="block">
			<div className={classes.root}>
				<div className={classes.simpleViewContent}>
					{imageUrl ? (
						<CardMedia
							className={classes.media}
							image={imageUrl}
							title={name}
						/>
					) : (
						<div className={classes.mediaPlaceholder} />
					)}
					<div className={classes.details}>
						<div className={classes.row1}>
							<div>
								<Typography className={classes.eventName} variant="title">
									{name}
								</Typography>
								<Typography className={classes.venueName} variant="subheading">
									Venue name
								</Typography>
								<Typography variant="caption">{eventDate}</Typography>
							</div>
							<div>{menuButton}</div>
						</div>
						<div className={classes.row2}>
							<div className={classes.statuses}>
								<Grid container spacing={0}>
									<Grid item xs={12} sm={12} md={6} lg={6}>
										<CheckBox style={{ cursor: "text" }} active={isPublished}>
											Published
										</CheckBox>
									</Grid>

									<Grid item xs={12} sm={12} md={6} lg={6}>
										<CheckBox style={{ cursor: "text" }} active={isOnSale}>
											On&nbsp;sale
										</CheckBox>
									</Grid>
								</Grid>
							</div>
							<div className={classes.totalsContainer}>
								<Total classes={classes} value={totalSold} color={"#707ced"}>
									Sold
								</Total>

								<div className={classes.totalsDivider} />

								<Total classes={classes} value={totalOpen} color={"#afc6d4"}>
									Open
								</Total>

								<div className={classes.totalsDivider} />

								<Total classes={classes} value={totalHeld} color={"#ff22b2"}>
									Held
								</Total>

								<div className={classes.totalsDivider} />

								<Total classes={classes} value={totalCapacity}>
									Capacity
								</Total>

								<div className={classes.totalsDivider} />

								<Total classes={classes} value={`$${totalSales}`}>
									Sales
								</Total>
							</div>
						</div>
						<div className={classes.row3}>
							<HorizontalBreakdownBar
								title="Ticket progress"
								values={[
									{ label: "Tickets sold", value: totalSold },
									{ label: "Tickets open", value: totalOpen },
									{ label: "Tickets held", value: totalHeld }
								]}
							/>
						</div>

						{!isExpanded ? (
							<div
								className={classes.expandIconRow}
								onClick={() => onExpandClick(id)}
							>
								<img src={"/icons/down-active.svg"} />
							</div>
						) : (
							<div className={classes.expandIconRowPlaceholder}>&nbsp;</div>
						)}
					</div>
				</div>

				<Collapse in={isExpanded}>
					<div className={classes.expandedViewContent}>
						<Grid container spacing={32}>
							{ticketTypes.map((ticketType, index) => (
								<Grid key={index} item xs={12} sm={6} lg={4}>
									<TicketTypeSalesBarChart
										name={ticketType.name}
										totalRevenue={Math.floor(ticketType.sales_total_in_cents /100)}
										values={[
											{
												label: "Sold",
												value: ticketType.sold_held + ticketType.sold_unreserved
											},
											{ label: "Open", value: ticketType.open },
											{ label: "Held", value: ticketType.held }
										]}
									/>
								</Grid>
							))}
						</Grid>
						<div
							className={classes.expandIconRow}
							onClick={() => onExpandClick(null)}
						>
							<img src={"/icons/up-active.svg"} />
						</div>
					</div>
				</Collapse>
			</div>
		</Card>
	);
};

EventSummaryCard.propTypes = {
	classes: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	imageUrl: PropTypes.string,
	name: PropTypes.string.isRequired,
	eventDate: PropTypes.string.isRequired,
	menuButton: PropTypes.element.isRequired,
	isPublished: PropTypes.bool.isRequired,
	isOnSale: PropTypes.bool.isRequired,
	totalSold: PropTypes.number.isRequired,
	totalOpen: PropTypes.number.isRequired,
	totalHeld: PropTypes.number.isRequired,
	totalCapacity: PropTypes.number.isRequired,
	totalSales: PropTypes.number.isRequired,
	isExpanded: PropTypes.bool.isRequired,
	onExpandClick: PropTypes.func.isRequired,
	ticketTypes: PropTypes.array.isRequired
};

export default withStyles(styles)(EventSummaryCard);
