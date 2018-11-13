import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import TicketTypeSalesBarChart from "../../../../elements/charts/TicketTypeSalesBarChart";
import Card from "../../../../elements/Card";
import Divider from "../../../../common/Divider";
import { Typography } from "@material-ui/core";
import classNames from "classnames";
import { fontFamilyDemiBold } from "../../../../styles/theme";
import VerticalBarChart from "../../../../elements/charts/VerticalBarChart";

const styles = theme => {
	return {
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

class Summary extends React.Component {
	constructor(props) {
		super(props);

		this.state = { activeNumbersCard: null, chartValues: [] };
	}

	componentDidMount() {
		//TODO load stats here
		//TODO make bn-api issue for date required

		this.setState({ chartValues: this.getDailyBreakdownValues() });
	}

	getDailyBreakdownValues() {
		let result = [];

		for (let index = 0; index < 30; index++) {
			const ticketsSales =
				Math.floor(Math.random() * Math.floor(100)) * index * 2;
			result.push({
				x: index + 1,
				y: ticketsSales,
				tooltipTitle: `$${ticketsSales}`,
				tooltipText: `${Math.floor(ticketsSales / 20)} Tickets`
			});
		}

		return result;
	}

	renderBarChart() {
		const { chartValues } = this.state;
		return <VerticalBarChart values={chartValues} />;
	}

	renderNumbers() {
		const { activeNumbersCard } = this.state;
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
						label="Revenue"
						value={`$26,438`}
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
						value={438}
						iconName="ticket"
						classes={classes}
					/>{" "}
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
						value={990}
						iconName="ticket"
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
						value={9}
						iconName="events"
						classes={classes}
					/>
				</Grid>
			</Grid>
		);
	}

	renderTicketVolumes() {
		return (
			<Grid container spacing={32}>
				<Grid item xs={12} sm={6} lg={4}>
					<TicketTypeSalesBarChart
						name={"General admission"}
						totalRevenue={2560}
						values={[
							{ label: "Sold", value: 123 },
							{ label: "Open", value: 345 },
							{ label: "Held", value: 67 }
						]}
					/>
				</Grid>
				<Grid item xs={12} sm={6} lg={4}>
					<TicketTypeSalesBarChart
						name={"VIP package"}
						totalRevenue={1345}
						values={[
							{ label: "Sold", value: 355 },
							{ label: "Open", value: 455 },
							{ label: "Held", value: 80 }
						]}
					/>
				</Grid>
				<Grid item xs={12} sm={6} lg={4}>
					<TicketTypeSalesBarChart
						name={"Fan club"}
						totalRevenue={1020}
						values={[
							{ label: "Sold", value: 234 },
							{ label: "Open", value: 33 },
							{ label: "Held", value: 51 }
						]}
					/>
				</Grid>
			</Grid>
		);
	}

	render() {
		return (
			<div>
				{this.renderBarChart()}

				<div style={{ marginTop: 60 }} />

				{this.renderNumbers()}

				<Divider style={{ marginTop: 40, marginBottom: 40 }} />

				<Typography variant="title">Ticket Volumes</Typography>
				{this.renderTicketVolumes()}
			</div>
		);
	}
}

Summary.propTypes = {
	event: PropTypes.object.isRequired
};

export default withStyles(styles)(Summary);
