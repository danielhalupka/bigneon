import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "../Card";

const styles = theme => ({
	root: {
		position: "absolute",
		top: 220
	},
	media: {
		width: "100%",
		height: 240,
		backgroundColor: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",

		paddingLeft: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit
	},
	content: {}
});

const EventDetailsOverlayCard = props => {
	const { classes, imageSrc, children, style } = props;

	return (
		<div className={classes.root} style={style}>
			<Card variant="subCard">
				<div
					className={classes.media}
					style={{ backgroundImage: `url(${imageSrc})` }}
				/>
				<div className={classes.content}>{children}</div>
			</Card>
		</div>
	);
};

EventDetailsOverlayCard.defaultProps = {
	style: {}
};

EventDetailsOverlayCard.propTypes = {
	classes: PropTypes.object.isRequired,
	imageSrc: PropTypes.string.isRequired,
	top: PropTypes.number,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(EventDetailsOverlayCard);
