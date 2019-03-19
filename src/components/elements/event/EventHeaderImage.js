import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import SupportingArtistsLabel from "../../pages/events/SupportingArtistsLabel";
import { fontFamilyBold, fontFamilyDemiBold } from "../../styles/theme";
import DateFlag from "./DateFlag";
import user from "../../../stores/user";
import nl2br from "../../../helpers/nl2br";
import { displayAgeLimit } from "../../../helpers/ageLimit";

const styles = theme => ({
	coverImageContainer: {
		width: "100%",
		overflow: "hidden",
		position: "relative"
	},
	coverImage: {
		width: "110%",
		backgroundColor: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		position: "absolute"
	},
	blurryImage: {
		WebkitFilter: "blur(5.5px)",
		filter: "blur(5.5px)",
		left: -15,
		right: -15,
		top: -15,
		bottom: -15
	},
	noCoverImage: {
		backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)"
	},
	content: {
		position: "absolute",
		left: 0
	},
	desktopContent: {
		paddingLeft: theme.spacing.unit * 12,
		paddingBottom: theme.spacing.unit * 3,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center"
	},
	mobileContent: {
		padding: theme.spacing.unit * 3,
		paddingTop: theme.spacing.unit * 6
	},
	topLineInfo: {
		marginTop: theme.spacing.unit * 2,
		color: "#FFFFFF",
		textTransform: "uppercase",
		fontFamily: fontFamilyBold,
		fontSize: theme.typography.fontSize * 1.1,
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
		marginBottom: theme.spacing.unit
	},
	eventNameMobile: {
		marginBottom: 0
	},
	shortEventNameText: {
		fontSize: theme.typography.fontSize * 3,
		lineHeight: 1
	},
	longEventNameText: {
		fontSize: theme.typography.fontSize * 1.8,
		lineHeight: 0.9
	},
	withArtists: {
		color: "#FFFFFF",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 2,
		lineHeight: 0.9
	},
	withArtistsDetailed: {
		color: "#FFFFFF",
		fontSize: theme.typography.fontSize * 1.6,
		lineHeight: 1
	},
	withArtistsMobile: {
		color: "#FFFFFF",
		fontFamily: fontFamilyDemiBold,
		lineHeight: 1,
		fontSize: theme.typography.fontSize * 1.5
	},
	spaceLine: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		width: 40,
		borderBottom: `3px solid ${theme.palette.secondary.main}`
	},
	smallDetailsText: {
		marginTop: theme.spacing.unit * 2,
		color: "#FFFFFF",
		fontSize: theme.typography.fontSize * 1,
		lineHeight: 1.4
	},
	desktopTextContent: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end"
	},
	email: {
		color: theme.palette.secondary.main
	}
});

const EventHeaderImage = props => {
	const {
		classes,
		variant,
		cover_image_url,
		displayEventStartDate,
		displayDoorTime,
		displayShowTime,
		name,
		top_line_info,
		eventStartDateMoment,
		artists,
		age_limit,
		height
	} = props;

	const desktopTop = 60; // * 0.35;

	const justifyContent = "flex-end";

	if (variant === "details") {
		//justifyContent = "flex-end";
		//desktopTop = desktopTop * 0.2;
	}

	if (variant === "success") {
		//justifyContent = "flex-end";
		//desktopTop = 0;
	}

	//Adjust these thresholds as needed
	const eventNameIsLongDesktop = name.length > 65;
	const eventNameIsLongMobile = name.length > 30;

	let coverImageDiv;
	if (cover_image_url) {
		coverImageDiv = (
			<div
				className={classNames({ [classes.coverImage]: true, [classes.blurryImage]: true })}
				style={{
					backgroundImage: `linear-gradient(to top, #000000, rgba(0, 0, 0, 0)),url(${cover_image_url})`,
					height: height * 1.1
				}}
			/>
		);
	} else {
		coverImageDiv = (
			<div
				className={classNames({ [classes.coverImage]: true, [classes.noCoverImage]: true })}
				style={{
					height: height * 1.1
				}}
			/>
		);
	}

	const ageLimit = displayAgeLimit(age_limit);
	return (
		<div>
			{/* DESKTOP */}
			<Hidden smDown implementation="css">
				<div className={classes.coverImageContainer} style={{ height }}>
					{coverImageDiv}
				</div>
				<Grid
					className={classNames(classes.content, classes.desktopContent)}
					style={{
						top: desktopTop,
						height,
						// borderStyle: "solid",
						// borderColor: "pink",
						justifyContent
					}}
					container
				>
					<Grid
						item
						xs={12}
						sm={10}
						md={5}
						lg={6}
						className={classes.desktopTextContent}
						//style={{ borderStyle: "solid", borderColor: "red" }}
					>
						{variant === "simple" ? (
							<div>
								<Typography className={classes.topLineInfo}>
									{nl2br(top_line_info)}
								</Typography>
								<Typography className={classNames({ [classes.eventName]: true, [classes.longEventNameText]: eventNameIsLongDesktop, [classes.shortEventNameText]: !eventNameIsLongDesktop })}>{name}</Typography>
								<Typography className={classes.withArtists}>
									<SupportingArtistsLabel eventName={name} artists={artists}/>
								</Typography>
							</div>
						) : null}

						{variant === "detailed" ? (
							<div>
								<DateFlag variant="rounded" date={eventStartDateMoment}/>
								<Typography className={classes.topLineInfo}>
									{top_line_info}
								</Typography>
								<Typography className={classNames({ [classes.eventName]: true, [classes.longEventNameText]: eventNameIsLongDesktop, [classes.shortEventNameText]: !eventNameIsLongDesktop })}>{name}</Typography>
								<Typography className={classes.withArtistsDetailed}>
									<SupportingArtistsLabel eventName={name} artists={artists}/>
								</Typography>

								<div className={classes.spaceLine}/>

								<Typography className={classes.smallDetailsText}>
									{displayEventStartDate}
									<br/>
									Doors {displayDoorTime} - Show {displayShowTime}
									<br/>
									{ageLimit}
								</Typography>
							</div>
						) : null}

						{variant === "success" ? (
							<div>
								<Typography className={classes.topLineInfo}>
									Success! You're going to
								</Typography>
								<Typography className={classNames({ [classes.eventName]: true, [classes.longEventNameText]: eventNameIsLongDesktop, [classes.shortEventNameText]: !eventNameIsLongDesktop })}>{name}</Typography>
								<Typography className={classes.withArtistsDetailed}>
									<SupportingArtistsLabel eventName={name} artists={artists}/>
								</Typography>

								<div className={classes.spaceLine}/>

								<Typography className={classes.smallDetailsText}>
									{displayEventStartDate}
									<br/>
									Doors {displayDoorTime} - Show {displayShowTime}
									<br/>
									{ageLimit}
								</Typography>

								<Typography className={classes.smallDetailsText}>
									{/* Order #1223444 */}
									<br/>
									We've sent your receipt to{" "}
									<span className={classes.email}>{user.email}</span>
								</Typography>

								{/*<Divider*/}
								{/*light*/}
								{/*height={1}*/}
								{/*style={{ marginTop: 20, marginBottom: 30 }}*/}
								{/*/>*/}

								{/*<Typography className={classes.topLineInfo}>*/}
								{/*Get the big NEON app*/}
								{/*<br />*/}
								{/*to access your tickets*/}
								{/*</Typography>*/}
								{/*<Typography className={classes.smallDetailsText}>*/}
								{/*The mobile app is required to use your tickets at the show*/}
								{/*</Typography>*/}
								{/*<br />*/}

								{/*<AppButton href={process.env.REACT_APP_STORE_IOS} variant="ios">*/}
								{/*iOS*/}
								{/*</AppButton>*/}

								{/*<span style={{ marginLeft: 20 }} />*/}

								{/*<AppButton*/}
								{/*href={process.env.REACT_APP_STORE_ANDROID}*/}
								{/*variant="android"*/}
								{/*>*/}
								{/*Android*/}
								{/*</AppButton>*/}
							</div>
						) : null}
					</Grid>
				</Grid>
			</Hidden>

			{/* Mobile */}
			<Hidden mdUp>
				<div className={classes.coverImageContainer} style={{ height }}>
					{coverImageDiv}
				</div>

				<div
					className={classNames(classes.content, classes.mobileContent)}
					style={{
						top: height * 0.1,
						height: height * 1.2
					}}
				>
					{variant === "simple" ? (
						<div>
							<Typography
								className={classNames({
									[classes.topLineInfo]: true,
									[classes.topLineInfoMobile]: true
								})}
							>
								{top_line_info}
							</Typography>
							<Typography
								className={classNames({
									[classes.eventName]: true,
									[classes.eventNameMobile]: true,
									[classes.longEventNameText]: eventNameIsLongMobile,
									[classes.shortEventNameText]: !eventNameIsLongMobile
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
								<SupportingArtistsLabel eventName={name} artists={artists}/>
							</Typography>
						</div>
					) : null}

					{variant === "detailed" ? (
						<div>
							<DateFlag variant="rounded" date={eventStartDateMoment}/>
							<Typography
								className={classNames({
									[classes.topLineInfo]: true,
									[classes.topLineInfoMobile]: true
								})}
							>
								{top_line_info}
							</Typography>
							<Typography
								className={classNames({
									[classes.eventName]: true,
									[classes.eventNameMobile]: true,
									[classes.longEventNameText]: eventNameIsLongMobile,
									[classes.shortEventNameText]: !eventNameIsLongMobile
								})}
							>
								{name}
							</Typography>
							<Typography
								className={classNames({
									[classes.withArtistsMobile]: true,
									[classes.withArtistsDetailed]: true
								})}
							>
								<SupportingArtistsLabel eventName={name} artists={artists}/>
							</Typography>

							<div className={classes.spaceLine}/>

							<Typography className={classes.smallDetailsText}>
								{displayEventStartDate}
								<br/>
								Doors {displayDoorTime} - Show {displayShowTime}
								<br/>
								{ageLimit}
							</Typography>
						</div>
					) : null}

					{variant === "success" ? (
						<div>
							<Typography
								className={classNames({
									[classes.topLineInfo]: true,
									[classes.topLineInfoMobile]: true
								})}
							>
								Success! You're going to
							</Typography>
							<Typography
								className={classNames({
									[classes.eventName]: true,
									[classes.eventNameMobile]: true,
									[classes.longEventNameText]: eventNameIsLongMobile,
									[classes.shortEventNameText]: !eventNameIsLongMobile
								})}
							>
								{name}
							</Typography>
							<Typography
								className={classNames({
									[classes.withArtistsMobile]: true,
									[classes.withArtistsDetailed]: true
								})}
							>
								<SupportingArtistsLabel eventName={name} artists={artists}/>
							</Typography>

							<div className={classes.spaceLine}/>

							<Typography className={classes.smallDetailsText}>
								{displayEventStartDate}
								<br/>
								Doors {displayDoorTime} - Show {displayShowTime}
								<br/>
								{ageLimit}
							</Typography>

							<Typography className={classes.smallDetailsText}>
								{/* Order #1223444 */}
								<br/>
								We've sent your receipt to{" "}
								<span className={classes.email}>{user.email}</span>
							</Typography>
						</div>
					) : null}
				</div>
			</Hidden>
		</div>
	);
};

EventHeaderImage.defaultProps = {
	height: 450,
	variant: "simple"
};

EventHeaderImage.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["simple", "detailed", "success"]),
	cover_image_url: PropTypes.string,
	name: PropTypes.string.isRequired,
	top_line_info: PropTypes.string,
	artists: PropTypes.array.isRequired,
	eventStartDateMoment: PropTypes.object.isRequired,
	height: PropTypes.number,
	displayEventStartDate: PropTypes.string.isRequired,
	displayDoorTime: PropTypes.string.isRequired,
	displayShowTime: PropTypes.string.isRequired,
	age_limit: PropTypes.oneOf(["string", "number"]).isRequired
};

export default withStyles(styles)(EventHeaderImage);
