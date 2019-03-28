import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import PropTypes from "prop-types";

import Bigneon from "../../../../../../helpers/bigneon";
import user from "../../../../../../stores/user";
import Loader from "../../../../../elements/loaders/Loader";
import SelectGroup from "../../../../../common/form/SelectGroup";
import Button from "../../../../../elements/Button";

const styles = theme => ({
	root: {}
});

class FacebookEvents extends Component {
	constructor(props) {
		super(props);

		this.state = {
			eventName: null,
			pages: [],
			pageId: null,
			facebookCategory: null,
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { eventId } = this.props;

		Bigneon()
			.external.facebook.pages()
			.then(response => this.setState({ pages: response.data }))
			.catch(error => {
				console.error(error);
			});
		//If you need event details, use the eventId prop
		// Bigneon()
		// 	.events.read({ id: eventId })
		// 	.then(response => {
		// 		this.setState({ event: response.data });
		// 	})
		// 	.catch(error => {
		// 		console.error(error);
		// 	});
	}

	onSubmit() {
		const { pageId, facebookCategory } = this.state;
		this.setState({ isSubmitting: true });
		Bigneon().external.facebook.createEvent({
			event_id: this.props.eventId,
			page_id: pageId,
			category: facebookCategory
		});
	}

	render() {
		const { pages, pageId, facebookCategory, isSubmitting } = this.state;

		return (
			<div>
				<SelectGroup
					items={pages.map(page => ({
						value: page.id,
						name: page.name
					}))}
					value={pageId}
					onChange={e => this.setState({ pageId: e.target.value })}
				/>

				<SelectGroup
					items={[{ value: "MUSIC_EVENT", name: "Music Event" }]}
					value={facebookCategory}
					onChange={e => this.setState({ facebookCategory: e.target.value })}
				/>
				<Button
					size="large"
					type="submit"
					variant="callToAction"
					onClick={this.onSubmit.bind(this)}
					disabled={isSubmitting}
				>
					Publish
				</Button>
			</div>
		);
	}
}

FacebookEvents.propTypes = {
	classes: PropTypes.object.isRequired,
	eventId: PropTypes.string.isRequired
};

export default withStyles(styles)(FacebookEvents);
