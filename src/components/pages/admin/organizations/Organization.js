import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";

import UpdateSection from "./sections/Update";
import TeamSection from "./sections/Team";
import FeeScheduleSection from "./sections/FeeSchedule";
import OtherFeesSection from "./sections/OtherFees";

import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";
import Card from "../../../elements/Card";
import StyledLink from "../../../elements/StyledLink";
import Loader from "../../../elements/loaders/Loader";

const styles = theme => ({
	root: {},
	card: {
		padding: theme.spacing.unit * 6
	},
	menu: {
		display: "flex"
	},
	menuText: {
		marginRight: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	}
});

@observer
class Organization extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: "details",
			organizationId: null
		};
	}

	static getDerivedStateFromProps(props, state) {
		let organizationId = null;
		if (props.match && props.match.params && props.match.params.id) {
			organizationId = props.match.params.id;
		}

		return { organizationId };
	}

	renderMenuOption(key, label) {
		const { classes } = this.props;
		const { activeTab } = this.state;

		return (
			<Typography className={classes.menuText}>
				<StyledLink
					underlined={activeTab === key}
					onClick={() => this.setState({ activeTab: key })}
				>
					{label}
				</StyledLink>
			</Typography>
		);
	}

	renderContent(organizationId) {
		const { activeTab } = this.state;
		const { history } = this.props;

		switch (activeTab) {
			case "details":
				return (
					<UpdateSection history={history} organizationId={organizationId}/>
				);
			case "team":
				return (
					<TeamSection history={history} organizationId={organizationId}/>
				);
			case "fees":
				return (
					<FeeScheduleSection
						type="read"
						history={history}
						organizationId={organizationId}
					/>
				);
			case "admin-fees-schedule":
				return (
					<FeeScheduleSection
						type="read-write"
						history={history}
						organizationId={organizationId}
					/>
				);
			case "admin-fees-other":
				return (
					<OtherFeesSection history={history} organizationId={organizationId}/>
				);

			default:
				return null;
		}
	}

	render() {
		const { classes } = this.props;

		let { organizationId } = this.state;
		if (organizationId === "current") {
			organizationId = user.currentOrganizationId;

			if (organizationId === null) {
				return <Loader/>;
			}
		}

		return (
			<div>
				<PageHeading
					iconUrl="/icons/account-multi.svg"
					style={{ marginBottom: 40 }}
				>
					{!organizationId ? "New " : ""}
					Organization Settings
				</PageHeading>

				<Card>
					<div className={classes.card}>
						{organizationId ? (
							<div className={classes.menu}>
								{this.renderMenuOption("details", "Details")}
								{this.renderMenuOption("team", "Team")}
								{user.isOrgOwner ? this.renderMenuOption("fees", "Fees") : null}
								{user.isAdmin
									? this.renderMenuOption(
										"admin-fees-schedule",
										"Fees schedule (Admin)"
									  )
									: null}
								{user.isAdmin
									? this.renderMenuOption(
										"admin-fees-other",
										"Other fees (Admin)"
									  )
									: null}
							</div>
						) : null}

						{this.renderContent(organizationId)}
					</div>
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Organization);
