import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import EventCard from "./EventCard";
import api from "../../../../helpers/api";
import notifications from "../../../../stores/notifications";

const styles = theme => ({
	subHeading: {
		marginBottom: theme.spacing.unit
	}
});

const EventGrid = ({ children }) => (
	<Grid item xs={12} sm={6} lg={4}>
		{children}
	</Grid>
);

class Results extends Component {
	constructor(props) {
		super(props);

		this.state = {
			searchValue: "",
			events: null
		};
	}

	componentDidMount() {
		api({ auth: true }) //TODO switch auth off when it works
			.get(`/events`)
			.then(response => {
				let events = [];

				let demoImageNumber = 100;
				response.data.forEach(event => {
					//console.log(event);
					const {
						id,
						event_start,
						name,
						organization_id,
						ticket_sell_date,
						venue_id
					} = event;

					events.push({
						id,
						name,
						description:
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut tempor lacus, vitae facilisis nisi. Etiam eleifend eros et odio rhoncus, a pellentesque sapien maximus.",
						imgSrc: `https://picsum.photos/800/400/?image=${demoImageNumber}`
					});
					demoImageNumber++;
				});

				this.setState({ events });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Loading events failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
		// event_start
		// id
		// name
		// organization_id
		// ticket_sell_date
		// venue_id

		const events = [
			{
				id: "1234",
				name: "The Beatles",
				description:
					"The final and totally real show. The Beatles were an English rock band formed in Liverpool in 1960.",
				imgSrc:
					"https://www.grammy.com/sites/com/files/styles/image_landscape_hero/public/beatles-hero-514890404.jpg?itok=0lUBO7km"
			},
			{
				id: "23456",
				name: "Jimi Hendrix",
				description:
					'James Marshall "Jimi" Hendrix was an American rock guitarist, singer, and songwriter.',
				imgSrc:
					"https://cdn.smehost.net/jimihendrixcom-uslegacyprod/wp-content/uploads/2017/12/171207_hendrix-bsots_525px-300x300.jpg"
			},
			{
				id: "345678",
				name: "Nirvana",
				description:
					"Nirvana was an American rock band formed by lead singer and guitarist Kurt Cobain and bassist Krist Novoselic in Aberdeen, Washington, in 1987",
				imgSrc:
					"http://static.tumblr.com/zzdsgce/mKFm0bdvk/178701_papel-de-parede-nirvana--178701_1600x1200.jpg"
			}
		];

		//setTimeout(() => this.setState({ events }), 1000);
	}

	renderEvents() {
		const { events } = this.state;

		return events.map(event => (
			<EventGrid key={event.id}>
				<EventCard {...event} />
			</EventGrid>
		));
	}

	render() {
		const { classes } = this.props;
		const { events } = this.state;

		return (
			<div>
				<Typography
					variant="subheading"
					gutterBottom
					className={classes.subHeading}
				>
					{events === null
						? "Searching for nearby events..."
						: "Showing events in San Francisco"}
				</Typography>
				<Grid container spacing={24}>
					{events ? this.renderEvents() : null}
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(Results);
