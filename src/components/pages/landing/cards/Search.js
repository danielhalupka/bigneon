import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { Paper } from "@material-ui/core";

import InputGroup from "../../../common/form/InputGroup";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import eventResults from "../../../../stores/eventResults";
import changeUrlParam from "../../../../helpers/changeUrlParam";

const styles = theme => ({
	card: {
		paddingLeft: theme.spacing.unit * 5,
		paddingRight: theme.spacing.unit * 5,
		paddingTop: theme.spacing.unit * 5,
		paddingBottom: theme.spacing.unit * 5,
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
			query: "",
			isSearching: false
		};
	}

	componentDidMount() {
		//Check the URL for a search query and default to those results first
		const url = new URL(window.location.href);
		const query = url.searchParams.get("search") || "";

		this.setState({ query });

		eventResults.refreshResults(
			{ query, status: "Published" },
			() => {},
			message => {
				notifications.show({
					message,
					variant: "error"
				});
			}
		);
	}

	onSearch(e) {
		e.preventDefault();

		const { query } = this.state;

		this.setState({ isSearching: true });

		//Changes the URL so link can be copy/pasted
		changeUrlParam("search", query);

		eventResults.refreshResults(
			{ query },
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
		const { query, isSearching } = this.state;

		const name = process.env.REACT_APP_NAME;

		return (
			<Paper className={classes.card}>
				<Typography className={classes.heading} variant="display1">
					{name} gets you access to your favorite artists' shows
				</Typography>

				<form noValidate autoComplete="off" onSubmit={this.onSearch.bind(this)}>
					<Grid direction="row" justify="center" alignItems="center" container>
						<Grid item xs={12} sm={12} lg={12}>
							<InputGroup
								value={query}
								name="query"
								placeholder="Search for an event, artist or venue"
								type="text"
								isSearch={true}
								onChange={e => this.setState({ query: e.target.value })}
							/>
						</Grid>

						<Grid item xs={12} sm={6} lg={4}>
							<Button
								type="submit"
								customClassName="callToAction"
								style={{ width: "100%" }}
								disabled={isSearching}
							>
								{isSearching ? "Searching..." : "Search"}
							</Button>
						</Grid>
					</Grid>
				</form>
			</Paper>
		);
	}
}

export default withStyles(styles)(SearchCard);
