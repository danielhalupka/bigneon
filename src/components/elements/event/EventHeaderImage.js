import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import SupportingArtistsLabel from "../../pages/events/SupportingArtistsLabel";
import { fontFamilyBold, fontFamilyDemiBold } from "../../styles/theme";

const height = 450;

const styles = theme => ({
	blurContainer: {
		width: "100%",
		height,
		overflow: "hidden",
		position: "relative"
	},
	blurryImage: {
		width: "110%",
		height: height * 1.1,
		backgroundColor: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		position: "absolute",
		WebkitFilter: "blur(5.5px)",
		filter: "blur(5.5px)",
		left: -15,
		right: -15,
		top: -15,
		bottom: -15
	},
	content: {
		position: "absolute",
		left: 0
	},
	desktopContent: {
		top: height * 0.35,
		height,
		paddingLeft: theme.spacing.unit * 12,
		paddingBottom: theme.spacing.unit * 3,
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end"
	},
	mobileContent: {
		top: height * 0.1,
		height: height * 1.2,
		padding: theme.spacing.unit * 3,
		paddingTop: theme.spacing.unit * 6
	},
	topLineInfo: {
		color: "#FFFFFF",
		textTransform: "uppercase",
		fontFamily: fontFamilyBold,
		fontSize: theme.typography.fontSize * 1.2,
		lineHeight: 1,
		marginBottom: theme.spacing.unit
	},
	topLineInfoMobile: {
		lineHeight: 2,
		fontSize: theme.typography.fontSize * 0.9
	},
	eventName: {
		color: "#FFFFFF",
		fontFamily: fontFamilyBold,
		fontSize: theme.typography.fontSize * 3,
		lineHeight: 1,
		marginBottom: theme.spacing.unit
	},
	eventNameMobile: {
		fontSize: theme.typography.fontSize * 3,
		marginBottom: 0
	},
	withArtists: {
		color: "#9da3b4",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 2,
		lineHeight: 1
	},
	withArtistsMobile: {
		lineHeight: 2,
		fontSize: theme.typography.fontSize * 1.5
	}
});

const EventHeaderImage = props => {
	const { classes, src, name, topLineInfo, artists } = props;

	return (
		<div>
			{/* DESKTOP */}
			<Hidden smDown implementation="css">
				<div className={classes.blurContainer}>
					<div
						className={classes.blurryImage}
						style={{ backgroundImage: `url(${src})` }}
					/>
				</div>

				<Grid
					className={classNames(classes.content, classes.desktopContent)}
					container
				>
					<Grid item xs={12} sm={12} lg={6}>
						<Typography className={classes.topLineInfo}>
							{topLineInfo}
						</Typography>
						<Typography className={classes.eventName}>{name}</Typography>
						<Typography className={classes.withArtists}>
							<SupportingArtistsLabel artists={artists} />
						</Typography>
					</Grid>
				</Grid>
			</Hidden>

			{/* Mobile */}
			<Hidden mdUp>
				<div className={classes.blurContainer}>
					<div
						className={classes.blurryImage}
						style={{ backgroundImage: `url(${src})` }}
					/>
				</div>

				<div className={classNames(classes.content, classes.mobileContent)}>
					<Typography
						className={classNames({
							[classes.topLineInfo]: true,
							[classes.topLineInfoMobile]: true
						})}
					>
						{topLineInfo}
					</Typography>
					<Typography
						className={classNames({
							[classes.eventName]: true,
							[classes.eventNameMobile]: true
						})}
					>
						{name}
					</Typography>
					<Typography
						className={classNames({
							[classes.withArtists]: true,
							[classes.withArtistsMobile]: true
						})}
					>
						<SupportingArtistsLabel artists={artists} />
					</Typography>
				</div>
			</Hidden>
		</div>
	);
};

EventHeaderImage.propTypes = {
	classes: PropTypes.object.isRequired,
	src: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	topLineInfo: PropTypes.string,
	artists: PropTypes.array.isRequired
};

export default withStyles(styles)(EventHeaderImage);
