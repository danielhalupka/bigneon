import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

import selectedEvent from "../../stores/selectedEvent";
import DefaultTemplate from "./templates/Default";

const BlankContainer = ({ children }) => (
	<div
		style={{
			height: window.innerHeight,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			textAlign: "center"
		}}
	>
		{children}
	</div>
);

@observer
class Embedded extends Component {
	constructor(props) {
		super(props);

		this.state = { notFoundMessage: null, height: 400 };
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				console.warn(errorMessage);

				this.setState({ notFoundMessage: errorMessage });
			});
		} else {
			this.setState({ notFoundMessage: "No event found." });
		}

		const url = new URL(window.location.href);
		const type = Number(url.searchParams.get("type")) || "default";
		const height = document.getElementById("root").clientHeight;
		this.setState({ height, type });
	}

	render() {
		const { type, notFoundMessage, height } = this.state;
		const { event } = selectedEvent;

		if (notFoundMessage) {
			return (
				<BlankContainer>
					<Typography variant="subheading">{notFoundMessage}</Typography>
				</BlankContainer>
			);
		}

		if (event === null) {
			return (
				<BlankContainer>
					<Typography variant="subheading">Loading...</Typography>
				</BlankContainer>
			);
		}

		if (event === false) {
			return (
				<BlankContainer>
					<Typography variant="subheading">Event not found.</Typography>
				</BlankContainer>
			);
		}

		switch (type) {
			case "default":
				return <DefaultTemplate height={height} {...selectedEvent} />;
			default:
				return <DefaultTemplate height={height} {...selectedEvent} />;
		}
	}
}

Embedded.propTypes = {
	match: PropTypes.object.isRequired
};

export default Embedded;
