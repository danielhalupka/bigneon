import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import UpdateCard from "./cards/UpdateCard";
// import LinkVenuesCard from "./cards/LinkVenuesCard";
import InviteUserCard from "./cards/InviteUserCard";
import FeeScheduleCard from "./cards/FeeScheduleCard";
import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class Organization extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: 0,
			organizationId: null
		};
	}

	componentDidMount() {
		user.toggleSideMenu(true);
	}

	static getDerivedStateFromProps(props, state) {
		let organizationId = null;
		if (props.match && props.match.params && props.match.params.id) {
			organizationId = props.match.params.id;
		}

		return { organizationId };
	}

	render() {
		const { activeTab, organizationId } = this.state;
		const { history } = this.props;

		return (
			<div>
				<PageHeading>
					{organizationId ? "Update" : "New"} organization
				</PageHeading>

				{organizationId ? (
					<Tabs
						value={activeTab}
						onChange={(event, activeTab) => this.setState({ activeTab })}
					>
						<Tab key={0} label="Details" />
						{/* <Tab key={1} label="Linked venues" /> */}
						<Tab key={1} label="Organization members" />
						<Tab key={2} label="Fee schedule" />
					</Tabs>
				) : null}

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{activeTab === 0 ? (
							<UpdateCard history={history} organizationId={organizationId} />
						) : null}

						{/* {activeTab === 1 ? (
							<LinkVenuesCard
								history={history}
								organizationId={organizationId}
							/>
						) : null} */}

						{activeTab === 1 ? (
							<InviteUserCard
								history={history}
								organizationId={organizationId}
							/>
						) : null}

						{activeTab === 2 ? (
							<FeeScheduleCard
								history={history}
								organizationId={organizationId}
							/>
						) : null}
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Organization);
