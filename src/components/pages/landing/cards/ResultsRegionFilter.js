import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import SelectGroup from "../../../common/form/SelectGroup";
import changeUrlParam from "../../../../helpers/changeUrlParam";
import eventResults from "../../../../stores/eventResults";
import notifications from "../../../../stores/notifications";

const styles = theme => ({
	subHeading: {
		marginBottom: theme.spacing.unit
	}
});

class ResultsRegionFilter extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cities: { "San fran": "San fran", "New York": "New York" },
			selectedCity: ""
		};
	}

	componentDidMount() {
		//TODO load possible regions
	}

	onSelect(e) {
		e.preventDefault();
		const selectedCity = e.target.value;

		this.setState({ selectedCity });

		//Changes the URL so link can be copy/pasted
		changeUrlParam("city", selectedCity);

		//Instantly filter on city
		eventResults.changeFilter("city", selectedCity);

		//Perform actual search query
		eventResults.refreshResults(
			{ query: { city: selectedCity } },
			() => {
				this.setState({ isSearching: false });
			},
			message => {
				this.setState({ isSearching: false });

				notifications.show({
					message,
					variant: "error"
				});
			}
		);
	}

	render() {
		const { classes } = this.props;
		const { cities, selectedCity, error } = this.state;

		return (
			<div style={{ display: "flex", flexDirection: "row" }}>
				<Typography
					variant="subheading"
					gutterBottom
					className={classes.subheading}
				>
					Showing events in
				</Typography>

				<SelectGroup
					value={selectedCity}
					items={cities}
					error={error}
					name={"cities"}
					onChange={this.onSelect.bind(this)}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(ResultsRegionFilter);
