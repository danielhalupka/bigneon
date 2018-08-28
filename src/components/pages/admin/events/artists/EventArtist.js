import React from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardMedia from "@material-ui/core/CardMedia";

import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import Button from "../../../../common/Button";

const styles = theme => ({
	grid: {
		marginBottom: theme.spacing.unit * 6
	},
	image: {
		width: "100%",
		height: 250,
		borderRadius: theme.shape.borderRadius
	}
});

const EventArtist = ({
	classes,
	image,
	title,
	typeHeading,
	setTime,
	onChangeSetTime,
	onDelete,
	error,
	onBlur
}) => {
	return (
		<Grid container spacing={24} className={classes.grid}>
			<Grid item xs={12} sm={12} lg={12}>
				<Typography variant="title">{typeHeading}</Typography>
			</Grid>
			<Grid item xs={12} sm={6} md={6} lg={6}>
				<CardMedia className={classes.image} image={image} title={"Artist"} />
			</Grid>
			<Grid item xs={12} sm={6} md={6} lg={6}>
				<Typography variant="subheading">{title}</Typography>

				<DateTimePickerGroup
					error={error}
					value={setTime}
					name="setTime"
					label="Set time"
					onChange={onChangeSetTime}
					format="HH:mm"
					type="time"
					onBlur={onBlur}
				/>

				<Button onClick={onDelete}>Remove</Button>
			</Grid>
		</Grid>
	);
};

EventArtist.propTypes = {
	classes: PropTypes.object.isRequired,
	image: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	typeHeading: PropTypes.string.isRequired,
	setTime: PropTypes.object,
	onChangeSetTime: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	error: PropTypes.string,
	onBlur: PropTypes.func
};

export default withStyles(styles)(EventArtist);
