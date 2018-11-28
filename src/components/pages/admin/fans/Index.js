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

		const users = [
			{
				id: "1",
				firstName: "John",
				lastName: "Smith",
				email: "john@smith.com",
				lastOrderDate: "20/02/2018",
				orders: 26,
				revenue: 1000,
				dateAdded: "1/04/18"
			},
			{
				id: "2",
				firstName: "Ham",
				lastName: "Sandwich",
				email: "ham@sam.com",
				lastOrderDate: "22/02/2018",
				orders: 21,
				revenue: 2000,
				dateAdded: "2/04/18",
				profilePicUrl: "/images/login-bg.jpg"
			}
		];

		setTimeout(() => {
			this.setState({ users });
		}, 50);
	}

	renderUsers() {
		const { users } = this.state;
		const { classes } = this.props;

		if (users === null) {
			return <Typography>Loading fans...</Typography>;
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
							id,
							firstName,
							lastName,
							email,
							lastOrderDate,
							orders,
							revenue,
							dateAdded,
							profilePicUrl
						} = user;
						return (
							<Link to={`/admin/fans/${id}`} key={id}>
								<FanRow shaded={!(index % 2)}>
									<div className={classes.nameProfileImage}>
										{profilePicUrl ? (
											<div
												className={classes.profileImageBackground}
												style={{ backgroundImage: `url(${profilePicUrl})` }}
											/>
										) : (
											<div className={classes.missingProfileImageBackground}>
												<img
													className={classes.missingProfileImage}
													src={"/images/profile-pic-placeholder-white.png"}
													alt={`${firstName} ${lastName}`}
												/>
											</div>
										)}
										&nbsp;&nbsp;
										<Typography className={classes.itemText}>
											{firstName} {lastName}
										</Typography>
									</div>

									<Typography className={classes.itemText}>{email}</Typography>
									<Typography className={classes.itemText}>
										{lastOrderDate}
									</Typography>
									<Typography className={classes.itemText}>{orders}</Typography>
									<Typography className={classes.itemText}>
										{revenue}
									</Typography>
									<Typography className={classes.itemText}>
										{dateAdded}
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
