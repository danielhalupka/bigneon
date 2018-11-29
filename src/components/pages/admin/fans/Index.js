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

const imageSize = 40;

const styles = theme => ({
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
			users: null
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
											? moment(last_order_time).format("DD/MM/YYYY")
											: "-"}
									</Typography>
									<Typography className={classes.itemText}>
										{order_count}
									</Typography>
									<Typography className={classes.itemText}>
										${Math.round(revenue_in_cents / 100)}
									</Typography>
									<Typography className={classes.itemText}>
										{created_at ? moment(created_at).format("DD/MM/YYYY") : "-"}
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
		const { users } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<PageHeading
					iconUrl="/icons/fan-hub-multi.svg"
					subheading={users ? `${users.length} total fans` : null}
				>
					Fans
				</PageHeading>

				<div className={classes.spacer} />

				{this.renderUsers()}
			</div>
		);
	}
}

export default withStyles(styles)(FanList);
