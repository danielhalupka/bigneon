import React, { Component } from "react";
import {
	Typography,
	withStyles,
	CardContent,
	Card
} from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});
class Reports extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: 0
		}
	}
	
	componentDidMount() {
		
	}

	loadReports() {
		
	}

	emptyCard(reportName) {
		const { classes } = this.props;
		return (
			<Card className={classes.paper}>
				<CardContent>
					<div>
						This report is not yet available for your organization.
					</div>
				</CardContent>
			</Card>
		)
	}

	render() {
		const { activeTab } = this.state;
		const { history } = this.props;
		const organizationId = user.currentOrganizationId;

		return (
			<div>
				<PageHeading>Organization Reports</PageHeading>
				<Tabs
					value={activeTab}
					onChange={(event, activeTab) => this.setState({ activeTab })}
				>
					<Tab key={0} label="Ticket Counts" />
					<Tab key={1} label="Transaction Detail" />
					<Tab key={2} label="Box Office Sales" />
					<Tab key={3} label="Reconciliation" />
					<Tab key={4} label="Weekly Event Settlement" />
				</Tabs>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{activeTab === 0 ? (
							this.emptyCard()
						) : null}

						{activeTab === 1 ? (
							this.emptyCard()
						) : null}

						{activeTab === 2 ? (
							this.emptyCard()
						) : null}

						{activeTab === 3 ? (
							this.emptyCard()
						) : null}
						{activeTab === 4 ? (
							this.emptyCard()
						) : null}
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Reports);