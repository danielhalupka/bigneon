import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";

import SelectGroup from "../../../common/form/SelectGroup";
import changeUrlParam from "../../../../helpers/changeUrlParam";
import eventResults from "../../../../stores/eventResults";
import notifications from "../../../../stores/notifications";

const styles = theme => ({
	subHeading: {
		marginBottom: theme.spacing.unit
	}
});

@observer
class ResultsRegionFilter extends Component {
	constructor(props) {
		super(props);

		// //TODO get this list of states from the API to be more dynamic
		// const stateArray = ["California", "Florida", "New York"];

		// this.state = {
		// 	s: "all"
		// };
	}

	componentDidMount() {
		//TODO load possible regions

		const url = new URL(window.location.href);
		const selectedState = url.searchParams.get("state") || "all";
		eventResults.changeFilter("state", selectedState);
	}

	onSelect(e) {
		e.preventDefault();
		const selectedState = e.target.value;

		//Changes the URL so link can be copy/pasted
		changeUrlParam("state", selectedState);

		//Instantly filter on state
		eventResults.changeFilter("state", selectedState);

		//Perform actual search query
		// eventResults.refreshResults(
		// 	{ state: selectedState },
		// 	() => {},
		// 	message => {
		// 		notifications.show({
		// 			message,
		// 			variant: "error"
		// 		});
		// 	}
		// );
	}

	render() {
		const { classes } = this.props;

		const selectedState = eventResults.filters["state"] || "all";

		return (
			<div style={{ display: "flex", flexDirection: "row" }}>
				<Typography
					variant="subheading"
					gutterBottom
					className={classes.subheading}
				>
					Showing events {selectedState !== "all" ? "in" : ""}
				</Typography>

				<SelectGroup
					value={selectedState}
					items={eventResults.statesDropdownValues}
					error={null}
					name={"states"}
					onChange={this.onSelect.bind(this)}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(ResultsRegionFilter);
