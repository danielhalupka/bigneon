import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import classNames from "classnames";
import moment from "moment-timezone";

import TicketTypeSalesBarChart from "../../../../elements/charts/TicketTypeSalesBarChart";
import Card from "../../../../elements/Card";
import Divider from "../../../../common/Divider";
import { fontFamilyDemiBold } from "../../../../../config/theme";
import VerticalBarChart from "../../../../elements/charts/VerticalBarChart";
import Container from "./Container";
import Bigneon from "../../../../../helpers/bigneon";
import notifications from "../../../../../stores/notifications";
import Loader from "../../../../elements/loaders/Loader";
import { observer } from "mobx-react";

const styles = theme => {
	return {
		root: {
			padding: theme.spacing.unit * 4,
			marginBottom: theme.spacing.unit
		},
		numbersCardContent: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			padding: theme.spacing.unit * 2,
			height: 100
		},
		numbersCardContentActive: {
			backgroundColor: theme.palette.primary.main
		},
		numbersCardLabel: {
			color: "#868f9b",
			textTransform: "uppercase",
			fontSize: theme.typography.fontSize * 0.8,
			fontFamily: fontFamilyDemiBold
		},
		numbersCardRow: {
			display: "flex",
			alignContent: "flex-start"
		},
		numbersCardValue: {
			fontSize: theme.typography.fontSize * 2.2
		},
		numbersCardActiveText: {
			color: "#FFFFFF"
		},
		numbersCardIcon: {
			width: 28,
			marginRight: theme.spacing.unit,
			marginBottom: theme.spacing.unit
		},
		emptyStateIllustration: {
			width: 200,
			justifyContent: "center"
		}
	};
};

const NumberCard = ({ classes, label, active, value, iconName }) => {
	return (
		<Card variant="subCard">
			<div
				className={classNames({
					[classes.numbersCardContent]: true,
					[classes.numbersCardContentActive]: !!active
				})}
			>
				<Typography
					className={classNames({
						[classes.numbersCardLabel]: true,
						[classes.numbersCardActiveText]: !!active
					})}
				>
					{label}
				</Typography>

				<div className={classes.numbersCardRow}>
					<img
						className={classes.numbersCardIcon}
						src={`/icons/${iconName}-${active ? "white" : "active"}.svg`}
						alt={iconName}
					/>
					<Typography
						className={classNames({
							[classes.numbersCardValue]: true,
							[classes.numbersCardActiveText]: !!active
						})}
					>
						{value}
					</Typography>
				</div>
			</div>
		</Card>
	);
};

@observer
class Summary extends Component {
	constructor(props) {
		super(props);

		this.state = {
			event: null,
			activeNumbersCard: null,
			chartValues: [],
			dayStats: [],
			venueTimeZone: ""
		};
	}

	componentDidMount() {
		//TODO make bn-api issue for date required

		const id = this.props.match.params.id;
		this.loadEventDetails(id);
		this.loadTimeZone(id);
	}

	loadEventDetails(id) {
		Bigneon()
			.events.dashboard({ id })
			.then(response => {
				const { day_stats, event, venue } = response.data;

				this.setState({
					event,
					dayStats: day_stats,
					chartValues: this.getDailyBreakdownValues(day_stats)
				});
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading event details failed.",
					error
				});
			});

	}

	loadTimeZone(id) {
		Bigneon()
			.events.read({ id })
			.then(response => {
				const { venue } = response.data;
				if (venue.timezone) {
					this.setState(({ venueTimeZone: venue.timezone }));
				}
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					defaultMessage: "Loading time zone for event failed.",
					error
				});
			});
	}

	getDailyBreakdownValues(dayStats) {
		const venueTimezone = this.state.venueTimeZone || "America/Los_Angeles";

		const result = [];
		for (let index = 0; index < dayStats.length; index++) {

			const dayOfMonth = moment.utc(dayStats[index].date).tz(venueTimezone).format("D");

			result.push({
				x: Number(dayOfMonth),
				y: dayStats[index].revenue_in_cents / 100,//  + Math.random() * 100,
				tooltipTitle: `$${(dayStats[index].revenue_in_cents / 100).toFixed(2)}`,
				tooltipText: `${dayStats[index].ticket_sales} Tickets`
			});
		}

		return result;
	}

	renderBarChart() {
		const { chartValues } = this.state;
		return <VerticalBarChart values={chartValues}/>;
	}

	renderNumbers() {
		const { activeNumbersCard, event } = this.state;
		const { classes } = this.props;
		return (
			<Grid container spacing={32}>

				<Grid
					item
					xs={12}
					sm={6}
					lg={3}
					onMouseEnter={() => this.setState({ activeNumbersCard: "revenue" })}
					onMouseLeave={() => this.setState({ activeNumbersCard: null })}
				>
					<NumberCard
						active={activeNumbersCard === "revenue"}
						label="Face value sales"
						value={"$" + (event.sales_total_in_cents / 100).toFixed(2)}
						iconName="chart"
						classes={classes}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					lg={3}
					onMouseEnter={() => this.setState({ activeNumbersCard: "sold" })}
					onMouseLeave={() => this.setState({ activeNumbersCard: null })}
				>
					<NumberCard
						active={activeNumbersCard === "sold"}
						label="Tickets sold"
						value={event.sold_held + event.sold_unreserved}
						iconName="ticket"
						classes={classes}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					lg={3}
					onMouseEnter={() => this.setState({ activeNumbersCard: "open" })}
					onMouseLeave={() => this.setState({ activeNumbersCard: null })}
				>
					<NumberCard
						active={activeNumbersCard === "open"}
						label="Tickets open"
						value={event.tickets_open}
						iconName="ticket"
						classes={classes}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					lg={3}
					onMouseEnter={() => this.setState({ activeNumbersCard: "attendance" })}
					onMouseLeave={() => this.setState({ activeNumbersCard: null })}
				>
					<NumberCard
						active={activeNumbersCard === "attendance"}
						label="Attendance"
						value={event.tickets_redeemed}
						iconName="tickets"
						classes={classes}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					lg={3}
					onMouseEnter={() => this.setState({ activeNumbersCard: "daysLeft" })}
					onMouseLeave={() => this.setState({ activeNumbersCard: null })}
				>
					<NumberCard
						active={activeNumbersCard === "daysLeft"}
						label="Days left"
						value={Math.max(0, moment(event.event_start).diff(moment(), "days"))}
						iconName="events"
						classes={classes}
					/>
				</Grid>
			</Grid>
		);
	}

	renderTicketVolumes() {
		const ticketTypes = this.state.event.ticket_types;

		return (
			<Grid container spacing={32}>
				{ticketTypes.map((ticketType, index) => {

					const remainingHeld = ticketType.held - ticketType.sold_held;
					// const valueDisplay = ticketType.held > 0 ? `${remainingHeld} / ${ticketType.held}` : "";
					return (

						<Grid key={index} item xs={12} sm={6} lg={4}>
							<TicketTypeSalesBarChart
								name={ticketType.name}
								totalRevenueInCents={ticketType.sales_total_in_cents}
								values={[
									{ label: "Sold", value: ticketType.sold_held + ticketType.sold_unreserved },
									{ label: "Open", value: ticketType.open },
									{ label: "Held", value: remainingHeld }
								]}
							/>
						</Grid>
					);
				})}
			</Grid>
		);
	}

	render() {
		const { event } = this.state;
		const { classes } = this.props;

		if (!event) {
			return <Loader/>;
		}

		if (event.is_external) {
			return (
				<Container eventId={event.id} subheading={"summary"}>
					<Grid
						container
						direction="column"
						justify="center"
						alignItems="center"
					>
						<img src="/images/no_sales_data_illustration.png" style={{ margin: 50, width: 200 }}/>
						<Typography variant="title">This event is externally hosted.</Typography>
					</Grid>
				</Container>
			);
		} else {
			return (
				<Container eventId={event.id} subheading={"summary"} useCardContainer>
					{this.renderBarChart()}

					<div style={{ marginTop: 60 }}/>

					{this.renderNumbers()}

					<Divider style={{ marginTop: 40, marginBottom: 40 }}/>

					<Typography variant="title">Ticket Volumes</Typography>
					{this.renderTicketVolumes()}
				</Container>
			);
		}
	}
}

export default withStyles(styles)(Summary);
