import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withStyles, Typography } from "@material-ui/core";
import moment from "moment";

import notifications from "../../../../stores/notifications";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import layout from "../../../../stores/layout";
import FanRow from "./FanRow";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold, primaryHex } from "../../../styles/theme";
import user from "../../../../stores/user";
import Button from "../../../elements/Button";
import downloadCSV from "../../../../helpers/downloadCSV";

const imageSize = 40;

const styles = theme => ({
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-end"
	},
	content: {
		padding: theme.spacing.unit * 6,
		paddingLeft: theme.spacing.unit * 8,
		paddingRight: theme.spacing.unit * 8
	},
	spacer: {
		marginTop: theme.spacing.unit * 4
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.95
	},
	itemText: {
		lineHeight: 0.5
	},
	nameProfileImage: {
		display: "flex",
		alignItems: "center"
	},
	profileImageBackground: {
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "50% 50%"
	},
	missingProfileImageBackground: {
		backgroundColor: primaryHex,
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	missingProfileImage: {
		width: imageSize * 0.45,
		height: "auto"
	}
});

class FanList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			users: null,
			isExporting: false
		};
	}

	componentDidMount() {
		layout.toggleSideMenu(true);
		this.loadFans();
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	exportCSV() {
		const organization_id = user.currentOrganizationId;

		if (!organization_id) {
			return null;
		}

		this.setState({ isExporting: true });

		Bigneon()
			.organizations.fans.index({ organization_id, limit: 99999999 }) //TODO api needs to handle all results queries
			.then(response => {
				const { data } = response.data;

				console.log(response.data);

				if (!data ||  data.length === 0) {
					return notifications.show({
						message: "No fans to export."
					});
				}

				let csvRows = [];

				csvRows.push(["Fans"]);
				csvRows.push([""]);
				csvRows.push([
					"First name",
					"Last name",
					"Email",
					"Last order date",
					"Orders",
					"Revenue",
					"Date added"
				]);

				data.forEach(user => {
					const {
						first_name,
						last_name,
						email,
						last_order_time,
						order_count,
						revenue_in_cents,
						created_at
					} = user;

					csvRows.push([
						first_name,
						last_name,
						email,
						moment.utc(last_order_time).local().format("MM/DD/YYYY h:mm:A"),
						order_count,
						`$${Math.round(revenue_in_cents / 100)}`,
						moment.utc(created_at).local().format("MM/DD/YYYY h:mm:A")
					]);
				});

				this.setState({ isExporting: false });

				downloadCSV(csvRows, "fans");
			})
			.catch(error => {
				this.setState({ isExporting: false });

				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Listing fans failed."
				});
			});
	}

	loadFans() {
		const organization_id = user.currentOrganizationId;

		if (!organization_id) {
			this.timeout = setTimeout(this.loadFans.bind(this), 500);
			return;
		}

		Bigneon()
			.organizations.fans.index({ organization_id })
			.then(response => {
				const { data } = response.data;

				this.setState({ users: data });
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Listing fans failed."
				});
			});
	}

	renderUsers() {
		const { users } = this.state;
		const { classes } = this.props;

		if (users === null) {
			return <Typography>Loading fans...</Typography>;
		}

		if (users.length === 0) {
			return <Typography>No fans currently.</Typography>;
		}

		return (
			<Card>
				<div className={classes.content}>
					<FanRow>
						<Typography className={classes.heading}>Name</Typography>
						<Typography className={classes.heading}>Email</Typography>
						<Typography className={classes.heading}>Last order date</Typography>
						<Typography className={classes.heading}>Orders</Typography>
						<Typography className={classes.heading}>Revenue</Typography>
						<Typography className={classes.heading}>Date added</Typography>
					</FanRow>
					{users.map((user, index) => {
						const {
							user_id,
							first_name,
							last_name,
							email,
							last_order_time,
							order_count,
							revenue_in_cents,
							created_at,
							thumb_profile_pic_url
						} = user;
						return (
							<Link to={`/admin/fans/${user_id}`} key={user_id}>
								<FanRow shaded={!(index % 2)}>
									<div className={classes.nameProfileImage}>
										{thumb_profile_pic_url ? (
											<div
												className={classes.profileImageBackground}
												style={{
													backgroundImage: `url(${thumb_profile_pic_url})`
												}}
											/>
										) : (
											<div className={classes.missingProfileImageBackground}>
												<img
													className={classes.missingProfileImage}
													src={"/images/profile-pic-placeholder-white.png"}
													alt={`${first_name} ${last_name}`}
												/>
											</div>
										)}
										&nbsp;&nbsp;
										<Typography className={classes.itemText}>
											{first_name} {last_name}
										</Typography>
									</div>

									<Typography className={classes.itemText}>{email}</Typography>
									<Typography className={classes.itemText}>
										{last_order_time
											? moment.utc(last_order_time).local().format("MM/DD/YYYY")
											: "-"}
									</Typography>
									<Typography className={classes.itemText}>
										{order_count}
									</Typography>
									<Typography className={classes.itemText}>
										${Math.round(revenue_in_cents / 100)}
									</Typography>
									<Typography className={classes.itemText}>
										{created_at ? moment.utc(created_at).local().format("MM/DD/YYYY") : "-"}
									</Typography>
								</FanRow>
							</Link>
						);
					})}
				</div>
			</Card>
		);
	}

	render() {
		const { users, isExporting } = this.state;
		const { classes } = this.props;

		return (
			<div>

				<div className={classes.header}>
					<PageHeading
						iconUrl="/icons/fan-hub-multi.svg"
						subheading={users ? `${users.length} total fans` : null}
					>
					Fans
					</PageHeading>
					<Button
						iconUrl="/icons/csv-active.svg"
						variant="text"
						onClick={!isExporting ? this.exportCSV.bind(this) : null}
					>
						{isExporting ? "Exporting..." : "Export CSV"}
					</Button>
				</div>

				<div className={classes.spacer} />

				{this.renderUsers()}
			</div>
		);
	}
}

export default withStyles(styles)(FanList);
