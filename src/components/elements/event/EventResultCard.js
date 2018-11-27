import React from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment";
import { Link } from "react-router-dom";

import PropTypes from "prop-types";
import Card from "../Card";
import { fontFamilyDemiBold, secondaryHex } from "../../styles/theme";

const styles = theme => ({
	card: {
		maxWidth: 400
	},
	media: {
		height: 200,
		width: "100%",
		backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		padding: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit,
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "flex-start",
		flexDirection: "column"
	},
	name: {
		color: "#FFFFFF",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.2,
		lineHeight: 1
	},
	detailsContent: {
		height: 65,
		display: "flex",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	singleDetail: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center"
	},
	label: {
		fontSize: theme.typography.fontSize * 0.75,
		textTransform: "uppercase",
		color: "#cccfd9"
	},
	value: {
		fontSize: theme.typography.fontSize * 0.8
	},
	priceTag: {
		backgroundColor: "#FFFFFF",
		padding: theme.spacing.unit,
		paddingTop: theme.spacing.unit + 3,
		borderRadius: "6px 6px 6px 0px",
		marginBottom: theme.spacing.unit
	},
	priceTagText: {
		color: secondaryHex,
		lineHeight: 0.5,
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.75
	}
});

const PriceTag = ({ classes, min, max }) => {
	if (!min || !max) {
		return null;
	}

	const minDollars = Math.round(min / 100);
	const maxDollars = Math.round(max / 100);
	let text = `$${minDollars} - $${maxDollars}`;

	if (minDollars === maxDollars) {
		`$${minDollars}`;
	}

	return (
		<div className={classes.priceTag}>
			<Typography className={classes.priceTagText}>{text}</Typography>
		</div>
	);
};

const EventResultCard = ({
	classes,
	id,
	name,
	promo_image_url,
	event_start,
	door_time,
	min_ticket_price,
	max_ticket_price
}) => {
	const style = {};
	if (promo_image_url) {
		style.backgroundImage = `url(${promo_image_url})`;
	}

	return (
		<Link to={`/events/${id}`}>
			<Card borderLess variant="default">
				<div className={classes.media} style={style}>
					<PriceTag
						min={min_ticket_price}
						max={max_ticket_price}
						classes={classes}
					/>
					<Typography className={classes.name}>{name}</Typography>
				</div>
				<div className={classes.detailsContent}>
					<div className={classes.singleDetail} style={{ textAlign: "left" }}>
						<Typography className={classes.label}>Date</Typography>
						<Typography className={classes.value}>
							{moment.utc(event_start).format("ddd, MMM Do")}
						</Typography>
					</div>
					<div className={classes.singleDetail} style={{ textAlign: "center" }}>
						<Typography className={classes.label}>Begins</Typography>
						<Typography className={classes.value}>
							{moment.utc(event_start).format("h:mm:a")}
						</Typography>
					</div>
					<div className={classes.singleDetail} style={{ textAlign: "right" }}>
						<Typography className={classes.label}>Door time</Typography>
						<Typography className={classes.value}>
							{moment.utc(door_time).format("h:mm:a")}
						</Typography>
					</div>
				</div>
			</Card>
		</Link>
	);
};

EventResultCard.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	promo_image_url: PropTypes.string,
	event_start: PropTypes.string.isRequired,
	door_time: PropTypes.string.isRequired,
	min_ticket_price: PropTypes.number.isRequired,
	max_ticket_price: PropTypes.number.isRequired
};

export default withStyles(styles)(EventResultCard);
