import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import UpdateCard from "./UpdateCard";
import LinkVenuesCard from "./LinkVenuesCard";
import InviteUserCard from "./InviteUserCard";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class Organization extends Component {
	constructor(props) {
		super(props);

		//Check if we're editing an existing organization
		let organizationId = null;
		if (props.match && props.match.params && props.match.params.id) {
			organizationId = props.match.params.id;
			this.organizationId = organizationId;
		}

		this.state = {
			activeTab: 0
		};
	}

	render() {
		const { activeTab } = this.state;
		const { classes } = this.props;

		return (
			<div>
				<Typography variant="display3">
					{this.organizationId ? "Update" : "Create"} organization
				</Typography>

				{this.organizationId ? (
					<Tabs
						value={activeTab}
						onChange={(event, activeTab) => this.setState({ activeTab })}
					>
						<Tab key={0} label="Details" />
						<Tab key={1} label="Linked venues" />
						<Tab key={2} label="Organization members" />
					</Tabs>
				) : null}

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						{activeTab === 0 ? (
							<UpdateCard organizationId={this.organizationId} />
						) : null}

						{activeTab === 1 ? (
							<LinkVenuesCard organizationId={this.organizationId} />
						) : null}

						{activeTab === 2 ? (
							<InviteUserCard organizationId={this.organizationId} />
						) : null}
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Organization);
