import React, { Component } from "react";
import PropTypes from "prop-types";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Card, CardContent } from "@material-ui/core";
import {
	withStyles
} from "@material-ui/core";
import VenueEventApi from "./endpoints/VenueEventApi";
import Bigneon from "../../../../../helpers/bigneon";
import SelectGroup from "../../../../common/form/SelectGroup";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	content: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit
	},
	menuContainer: {
		display: "flex",
		marginBottom: theme.spacing.unit * 2
	},
	menuText: {
		marginRight: theme.spacing.unit * 4
	},
	pre: {
		backgroundColor: "#efefef",
		padding: "5px"
	}
});

class ApiCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: 0,
			errors: {},
			isSubmitting: false,
			venues: [],
			venueId: ""
		};
	}

	componentDidMount() {
		const { organizationId } = this.props;
		Bigneon().organizations.venues.index({ organization_id: organizationId }).then(result => {
			let { data } = result;
			let { paging } = data;
			let venues = [];
			let venueId = "";
			if (paging.total) {
				venues = data.data;
				venueId = venues[0].id;
			}
			this.setState(({ venues, venueId }));
		});
	}

	render() {
		const { classes } = this.props;
		const { activeTab, venues, venueId } = this.state;
		const venueItems = venues.map(item => ({ value: item.id, label: item.name }));
		return (
			<Card className={classes.paper}>
				<CardContent>
					<SelectGroup value={venueId} items={venueItems} name={"venue-id"}
								 label={"Venue"}
								 onChange={e => {
									 this.setState({ venueId: e.target.value });
								 }}/>
					<Tabs
						value={activeTab}
						onChange={(event, activeTab) => this.setState({ activeTab })}
					>
						<Tab key={0} label="Events by Venue"/>
					</Tabs>
					{activeTab === 0 && venueId ? (
						<VenueEventApi classes={classes} venueId={venueId}/>) : (<h3>No Venues Available</h3>)}

				</CardContent>
			</Card>
		);
	}
}

ApiCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(ApiCard);
