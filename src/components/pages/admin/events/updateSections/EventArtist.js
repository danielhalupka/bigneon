import React from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import CardMedia from "@material-ui/core/CardMedia";

import DateTimePickerGroup from "../../../../common/form/DateTimePickerGroup";
import Button from "../../../../elements/Button";
import FormatInputLabel from "../../../../elements/form/FormatInputLabel";
import SocialIconLink from "../../../../elements/social/SocialIconLink";
import IconButton from "../../../../elements/IconButton";

const styles = theme => ({
	root: {
		display: "flex",
		height: 160
	},
	image: {
		flex: 1,
		width: "100%",
		height: "100%",
		borderRadius: 0
	},
	content: {
		paddingLeft: theme.spacing.unit * 2,
		//paddingRight: theme.spacing.unit * 2,
		display: "flex",
		flex: 2
	},
	leftColumn: {
		flex: 1
	},
	rightColumn: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
		justifyContent: "space-between"
	}
});

const EventArtist = ({
	classes,
	imgUrl,
	title,
	typeHeading,
	setTime,
	onChangeSetTime,
	onDelete,
	error,
	onBlur,
	socialAccounts
}) => {
	return (
		<div className={classes.root}>
			<CardMedia className={classes.image} image={imgUrl} title={"Artist"} />
			<div className={classes.content}>
				<div className={classes.leftColumn}>
					<Typography variant="body1" style={{ marginTop: 10 }}>
						<FormatInputLabel>{typeHeading}</FormatInputLabel>
					</Typography>
					<Typography variant="title">{title}</Typography>

					<DateTimePickerGroup
						margin="dense"
						error={error ? error.setTime : null}
						value={setTime}
						name="setTime"
						label="Set time"
						onChange={onChangeSetTime}
						format="HH:mm"
						type="time"
						onBlur={onBlur}
					/>
				</div>

				<div className={classes.rightColumn}>
					<div>
						<IconButton onClick={onDelete} iconUrl="/icons/delete-gray.svg">
							Delete
						</IconButton>
					</div>

					<div>
						{/* //TODO place back when we have icons and links */}
						{/* {Object.keys(socialAccounts).map(
							account =>
								socialAccounts[account] ? (
									<SocialIconLink
										color="black"
										key={account}
										icon={account}
										size={30}
									/>
								) : null
						)} */}
					</div>
				</div>
			</div>
		</div>
	);
};

EventArtist.propTypes = {
	classes: PropTypes.object.isRequired,
	imgUrl: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	typeHeading: PropTypes.string.isRequired,
	setTime: PropTypes.object,
	onChangeSetTime: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	error: PropTypes.object,
	onBlur: PropTypes.func,
	socialAccounts: PropTypes.object.isRequired
};

export default withStyles(styles)(EventArtist);
