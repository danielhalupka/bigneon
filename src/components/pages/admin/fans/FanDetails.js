import React, { Component } from "react";
import { withStyles, Typography, Divider } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";
import FanHistoryCard from "./FanHistoryCard";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold } from "../../../styles/theme";
import SocialIconLink from "../../../elements/social/SocialIconLink";
import StyledLink from "../../../elements/StyledLink";

const imageSize = 100;

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 5
	},
	profileImage: {
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "50% 50%"
	},
	missingProfileImageContainer: {
		borderStyle: "dashed",
		borderWidth: 0.5,
		borderColor: "#d1d1d1",
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	missingProfileImage: {
		width: imageSize * 0.35,
		height: "auto"
	},
	profileContainer: {
		//borderStyle: "solid",
		display: "flex"
	},
	profileDetails: {
		// borderStyle: "solid",
		// borderColor: "red",
		marginLeft: theme.spacing.unit * 2,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around"
	},
	name: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5,
		lineHeight: 1
	},
	email: {
		color: "#9DA3B4",
		lineHeight: 1
	},
	facebookContainer: {
		display: "flex",
		alignItems: "center"
	},
	facebook: {
		fontSize: theme.typography.fontSize * 0.7,
		color: "#9DA3B4",
		marginLeft: theme.spacing.unit,
		lineHeight: 1
	},
	overviewStatsContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end"
	},
	statsHeading: {
		color: "#9DA3B4"
	},
	statValue: {
		fontFamily: fontFamilyDemiBold
	},
	verticalDivider: {
		borderLeft: "1px solid #DEE2E8",
		height: 45
	},
	verticalDividerSmall: {
		borderLeft: "1px solid #DEE2E8",
		height: 20
	},
	historyHeading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5,
		marginTop: theme.spacing.unit * 4
	}
});

class Fan extends Component {
	constructor(props) {
		super(props);

		this.userId = props.match.params.id;

		this.state = {
			profile: null,
			history: null,
			activeHeading: "sales"
		};
	}

	componentDidMount() {
		this.loadFan();
	}

	loadFan() {
		const organization_id = user.currentOrganizationId;

		if (!organization_id) {
			this.timeout = setTimeout(this.loadFan.bind(this), 500);
			return;
		}

		const user_id = this.userId;

		Bigneon()
			.organizations.fans.read({ user_id, organization_id })
			.then(response => {
				this.setState(
					{ profile: response.data },
					this.loadFanHistory.bind(this)
				);
			})
			.catch(error =>
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load fan profile."
				})
			);
	}

	loadFanHistory() {
		const organization_id = user.currentOrganizationId;
		const user_id = this.userId;

		Bigneon()
			.organizations.fans.history({ user_id, organization_id })
			.then(result => {
				this.setState({ history: result.data.data });
			})
			.catch(error =>
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load fan history."
				})
			);
	}

	renderProfile() {
		const { classes } = this.props;
		const { profile } = this.state;

		const {
			first_name,
			last_name,
			email,
			facebook_linked,
			profile_pic_url,
			event_count,
			revenue_in_cents,
			ticket_sales
		} = profile;

		const profilePic = profile_pic_url ? (
			<div
				className={classes.profileImage}
				style={{ backgroundImage: `url(${profile_pic_url})` }}
			/>
		) : (
			<div className={classes.missingProfileImageContainer}>
				<img
					className={classes.missingProfileImage}
					src={"/images/profile-pic-placeholder.png"}
					alt={first_name}
				/>
			</div>
		);

		return (
			<div className={classes.profileContainer}>
				{profilePic}
				<div className={classes.profileDetails}>
					<Typography className={classes.name}>
						{first_name} {last_name}
					</Typography>
					<Typography className={classes.email}>{email}</Typography>
					<div className={classes.facebookContainer}>
						<SocialIconLink icon="facebook" color="black"/>
						<Typography className={classes.facebook}>
							{facebook_linked
								? "Facebook connected"
								: "Facebook not connected"}
						</Typography>
					</div>
				</div>
			</div>
		);
	}

	renderMenu() {
		const { classes } = this.props;
		const { activeHeading } = this.state;

		return (
			<Grid item xs={12} sm={6} md={4} lg={3}>
				<Grid container spacing={24}>
					<Grid item xs={3} sm={3} lg={3}>
						<Typography className={classes.menuText}>
							<StyledLink
								underlined={activeHeading === "sales"}
								onClick={() => this.setState({ activeHeading: "sales" })}
							>
								Sales
							</StyledLink>
						</Typography>
					</Grid>

					<Grid item xs={1} sm={1} lg={1}>
						<div className={classes.verticalDividerSmall}/>
					</Grid>

					<Grid item xs={3} sm={3} lg={3}>
						<Typography className={classes.menuText}>
							<StyledLink
								underlined={activeHeading === "attendance"}
								onClick={() => this.setState({ activeHeading: "attendance" })}
							>
								Attendance
							</StyledLink>
						</Typography>
					</Grid>
				</Grid>
			</Grid>
		);
	}

	renderSales() {
		const { history } = this.state;

		if (history === null) {
			return <Typography>Loading history...</Typography>;
		}
		return history.map((item, index) => {
			return <FanHistoryCard key={index} {...item}/>;
		});
	}

	renderAttendance() {
		return null;
	}

	render() {
		const { profile, activeHeading } = this.state;

		if (profile === null) {
			return <Typography>Loading fan details...</Typography>;
		}

		const { event_count, revenue_in_cents, ticket_sales } = profile;

		const { classes } = this.props;

		return (
			<div>
				<PageHeading
					iconUrl="/icons/fan-hub-active.svg"
					// subheading={<Link to="/admin/fans">Go back</Link>}
				>
					Fan Profile
				</PageHeading>

				<Card>
					<div className={classes.card}>
						<Grid container spacing={24}>
							<Grid item xs={12} sm={8} lg={8}>
								{this.renderProfile()}
							</Grid>

							<Grid
								item
								xs={12}
								sm={4}
								lg={4}
								className={classes.overviewStatsContainer}
							>
								<Grid container spacing={24}>
									<Grid item xs={3} sm={3} lg={3}>
										<Typography className={classes.statsHeading}>
											Events
										</Typography>
										<Typography className={classes.statValue}>
											{event_count}
										</Typography>
									</Grid>

									<Grid item xs={1} sm={1} lg={1}>
										<div className={classes.verticalDivider}/>
									</Grid>

									<Grid item xs={3} sm={3} lg={3}>
										<Typography className={classes.statsHeading}>
											Revenue
										</Typography>
										<Typography className={classes.statValue}>
											${(revenue_in_cents / 100).toFixed(2)}
										</Typography>
									</Grid>

									<Grid item xs={1} sm={1} lg={1}>
										<div className={classes.verticalDivider}/>
									</Grid>

									<Grid item xs={3} sm={3} lg={3}>
										<Typography className={classes.statsHeading}>
											Tickets
										</Typography>
										<Typography className={classes.statValue}>
											{ticket_sales}
										</Typography>
									</Grid>
								</Grid>
							</Grid>

							<Grid item xs={12}>
								<Divider/>
								<Typography className={classes.historyHeading}>
									History
								</Typography>
							</Grid>

							{this.renderMenu()}
						</Grid>

						<Grid
							item
							xs={12}
							sm={12}
							md={12}
							lg={12}
							style={{ paddingTop: 20 }}
						>
							{activeHeading === "sales"
								? this.renderSales()
								: this.renderAttendance()}
						</Grid>
					</div>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Fan);
