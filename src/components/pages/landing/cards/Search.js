import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { Paper } from "@material-ui/core";
import InputGroup from "../../../common/form/InputGroup";

const styles = theme => ({
	card: {
		paddingLeft: theme.spacing.unit * 5,
		paddingRight: theme.spacing.unit * 5,
		paddingTop: theme.spacing.unit * 10,
		paddingBottom: theme.spacing.unit * 10,

		textAlign: "center"
	},
	heading: {
		marginBottom: theme.spacing.unit * 10
	}
});

class SearchCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			searchValue: ""
		};
	}
	render() {
		const { classes } = this.props;
		const { searchValue } = this.state;

		const name = process.env.REACT_APP_NAME;

		return (
			<Paper className={classes.card}>
				<Typography className={classes.heading} variant="display1">
					{name} gets you access to your favourite artists' shows
				</Typography>

				<InputGroup
					value={searchValue}
					name="searchValue"
					placeholder="Search for an event, artist or venue"
					type="text"
					isSearch={true}
					onChange={e => this.setState({ searchValue: e.target.value })}
				/>
			</Paper>
		);
	}
}

export default withStyles(styles)(SearchCard);
