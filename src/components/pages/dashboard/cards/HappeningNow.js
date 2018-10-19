import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import LinearProgress from "@material-ui/core/LinearProgress";
import AttendanceIcon from "@material-ui/icons/PersonAdd";

import { Hidden } from "@material-ui/core";
import Button from "../../../elements/Button";

const styles = theme => ({
	card: {
		display: "flex"
	},
	details: {
		display: "flex",
		flexDirection: "column"
	},
	content: {
		flex: "1 0 auto",
		flexDirection: "row",
		display: "flex"
	},
	cover: {
		width: 151
		//height: 151
	},
	progressBars: {
		flex: 1,
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit
	},

	heading: {
		flexDirection: "row",
		display: "flex"
	},
	playIcon: {
		height: 40,
		width: 40,
		marginTop: -4
	},
	progressIcon: {
		height: 50,
		width: 50,
		marginRight: 12
	}
});

const ProgressSection = ({ title, subtitle, value, color, classes }) => {
	return (
		<div>
			<div className={classes.heading}>
				<AttendanceIcon className={classes.progressIcon} color="action" />
				<div>
					<Typography variant="subheading" color="textSecondary">
						{title}
					</Typography>
					<Typography variant="subheading" color="textSecondary">
						{subtitle}
					</Typography>
				</div>
			</div>
			<LinearProgress color={color} value={value} variant="determinate" />
		</div>
	);
};

class HappeningNow extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: "House Of Bass/Dust 3",
			imageUrl:
				"https://image-ticketfly.imgix.net/00/02/96/16/45-og.jpg?w=500&h=334&fit=crop&crop=top",
			publisher: "Public Works - San Francisco, CA",

			fanAttendance: 30,
			totalFans: 100,

			ticketSales: 120,
			totalTickets: 220,

			revenue: 6000,
			totalRevenue: 7040
		};
	}

	render() {
		const { classes } = this.props;
		const {
			title,
			imageUrl,
			publisher,
			fanAttendance,
			totalFans,
			ticketSales,
			totalTickets,
			revenue,
			totalRevenue
		} = this.state;

		const Spacer = () => <div style={{ margin: 20 }} />;

		const progressSection = (
			<div className={classes.progressBars}>
				<ProgressSection
					title={"Fan attendance"}
					subtitle={`${fanAttendance} of ${totalFans} Checked In`}
					value={(fanAttendance / totalFans) * 100}
					color="primary"
					classes={classes}
				/>
				<Spacer />
				<ProgressSection
					title={"Ticket sales"}
					subtitle={`${ticketSales} of ${totalTickets} Checked In`}
					value={(ticketSales / totalTickets) * 100}
					color="secondary"
					classes={classes}
				/>
				<Spacer />
				<ProgressSection
					title={"Ticket revenue"}
					subtitle={`$${revenue.toLocaleString()} of $${totalRevenue.toLocaleString()}`}
					value={(revenue / totalRevenue) * 100}
					color="primary"
					classes={classes}
				/>
			</div>
		);

		return (
			<div>
				<Card className={classes.card}>
					<CardContent className={classes.content}>
						<div>
							<div className={classes.heading}>
								<Typography variant="headline">Happening Now</Typography>
								<PlayArrowIcon className={classes.playIcon} />
							</div>

							<Typography variant="display1">{title}</Typography>

							<Typography variant="subheading" color="textSecondary">
								{publisher}
							</Typography>

							<Spacer />

							<Button variant="primary" style={{ width: "100%" }}>
								Box office
							</Button>
							<Spacer />

							<Button variant="secondary" style={{ width: "100%" }}>
								Fan engagement
							</Button>
						</div>
						<Hidden smDown>{progressSection}</Hidden>
					</CardContent>

					<Hidden smDown>
						{imageUrl ? (
							<CardMedia
								style={{ minWidth: 280 }}
								className={classes.cover}
								image={imageUrl}
								title={title}
							/>
						) : null}
					</Hidden>
				</Card>
			</div>
		);
	}
}

HappeningNow.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(HappeningNow);
