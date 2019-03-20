import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Button from "../../../../elements/Button";
import Card from "../../../../elements/Card";
import user from "../../../../../stores/user";

const styles = theme => ({
	root: {},
	processButtonContainer: {
		padding: theme.spacing.unit * 2,
		display: "flex"
		//justifyContent: "flex-end"
	}
});

class SettlementReportList extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	renderProcessSettlementCard() {
		const { classes } = this.props;

		if (user.isAdmin) {
			return (
				<Card variant={"block"}>
					<div className={classes.processButtonContainer}>
						<Link to={"/admin/reports/create-settlement"}>
							<Button variant="callToAction">Process settlement</Button>
						</Link>
					</div>
				</Card>
			);
		}
	}

	render() {
		return (
			<div>
				{this.renderProcessSettlementCard()}
			</div>
		);
	}
}

SettlementReportList.propTypes = {
	classes: PropTypes.object.isRequired,
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(SettlementReportList);
