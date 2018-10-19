import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import eventResults from "../../../stores/eventResults";
import changeUrlParam from "../../../helpers/changeUrlParam";
import notifications from "../../../stores/notifications";

const styles = {
	root: {
		display: "flex"
	},
	input: {
		border: "none",
		fontSize: 14,
		outline: "none"
	},
	icon: {
		marginRight: 12
	}
};

//TODO this might become a multi functional search bar, not just for events
class SearchToolBarInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			query: "",
			isSearching: false
		};
	}

	componentDidMount() {}

	onEventSearch(e) {
		e.preventDefault();

		const { query, isSearching } = this.state;

		if (isSearching) {
			return;
		}

		this.setState({ isSearching: true });

		//Redirect home to show results
		this.props.history.push("/");
		//Changes the URL so link can be copy/pasted and the search bar on the home page is pre populated
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

		return (
			<form
				noValidate
				autoComplete="off"
				onSubmit={this.onEventSearch.bind(this)}
				className={classes.root}
				onClick={() => this.input.focus()} //If they click near the input focus the input
			>
				<img
					alt="Search icon"
					className={classes.icon}
					src="/icons/search-gray.svg"
				/>
				<input
					ref={input => {
						this.input = input;
					}}
					disabled={isSearching}
					value={query}
					onChange={e => this.setState({ query: e.target.value })}
					className={classes.input}
					placeholder="Search events"
				/>
			</form>
		);
	}
}

SearchToolBarInput.propTypes = {
	classes: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchToolBarInput);
