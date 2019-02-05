import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import { observer } from "mobx-react";

import IntegrationCard from "./cards/IntegrationCard";
import WidgetCard from "./cards/WidgetCard";
import ApiCard from "./cards/ApiCard";
import EmailCard from "./cards/EmailCard";
import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";
import Loader from "../../../elements/loaders/Loader";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

@observer
class Marketing extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: 0,
			organizationId: null
		};
	}

	renderContent() {
		const { activeTab } = this.state;
		const { history } = this.props;

		const organizationId = user.currentOrganizationId;

		return (
			<div>
				<Tabs
					value={activeTab}
					onChange={(event, activeTab) => this.setState({ activeTab })}
				>
					<Tab key={0} label="Email"/>
					<Tab key={1} label="Widget"/>
					<Tab key={2} label="Analytics"/>
					<Tab key={3} label="API"/>
				</Tabs>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{activeTab === 0 ? (
							<EmailCard history={history} organizationId={organizationId}/>
						) : null}

						{activeTab === 1 ? (
							<WidgetCard history={history} organizationId={organizationId}/>
						) : null}

						{activeTab === 2 ? (
							<IntegrationCard
								history={history}
								organizationId={organizationId}
							/>
						) : null}

						{activeTab === 3 ? (
							<ApiCard history={history} organizationId={organizationId}/>
						) : null}
					</Grid>
				</Grid>
			</div>
		);
	}

	render() {
		const organizationId = user.currentOrganizationId;

		return (
			<div>
				<PageHeading>Marketing Integrations</PageHeading>

				{organizationId ? (
					this.renderContent()
				) : (
					<Loader/>
				)}
			</div>
		);
	}
}

export default withStyles(styles)(Marketing);
