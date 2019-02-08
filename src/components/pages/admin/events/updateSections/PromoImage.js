import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";

import notifications from "../../../../../stores/notifications";
import cloudinaryWidget from "../../../../../helpers/cloudinaryWidget";
import MaintainAspectRatio from "../../../../elements/MaintainAspectRatio";
import CheckBox from "../../../../elements/form/CheckBox";
import { fontFamily } from "../../../../styles/theme";
import { Hidden } from "@material-ui/core";

const height = 480;

const styles = theme => ({
	root: {
		paddingBottom: theme.spacing.unit * 2
	},
	media: {
		height: "100%"
	},
	noMedia: {
		cursor: "pointer",
		height: height * 0.6,
		backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
		padding: theme.spacing.unit * 5,
		marginBottom: theme.spacing.unit * 5,

		[theme.breakpoints.down("xs")]: {
			height: height * 0.3,
			padding: theme.spacing.unit * 2
		}
	},
	noMediaContent: {
		height: "100%",
		border: "dashed 0.7px #ffffff",
		borderRadius: 4,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center"
	},
	captionContainer: {
		textAlign: "right",
		paddingTop: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingLeft: theme.spacing.unit
	},
	caption: {
		fontSize: theme.typography.fontSize * 0.85,
		color: "#9DA3B4",
		fontFamily: fontFamily
	},
	iconDiv: {
		display: "flex",
		justifyContent: "flex-end",
		paddingRight: theme.spacing.unit * 4
	},
	iconOuter: {
		cursor: "pointer",
		position: "relative",
		top: -35,
		width: 70,
		height: 70,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)",
		backgroundImage: "linear-gradient(224deg, #e53d96, #5491cc)"
	},
	icon: {
		width: 35,
		height: 35,
		position: "relative",
		right: -2
	},
	noMediaIcon: {
		width: 28,
		height: 28,
		marginBottom: theme.spacing.unit * 2,

		[theme.breakpoints.down("xs")]: {
			marginBottom: 0
		}
	},
	noMediaText: {
		color: "#FFF"
	},
	bottomRowContainer: {
		display: "flex",
		justifyContent: "space-between",

		[theme.breakpoints.down("sm")]: {
			justifyContent: "flex-end"
		}
	},
	checkboxContainer: {
		display: "flex",
		justifyContent: "flex-start",
		paddingTop: theme.spacing.unit * 2 - 2,
		paddingLeft: theme.spacing.unit * 2,

		[theme.breakpoints.down("sm")]: {
			justifyContent: "flex-end",
			paddingTop: 0,
			paddingBottom: theme.spacing.unit * 4,
			paddingLeft: theme.spacing.unit
		}
	}
});

const uploadWidget = onSuccess => {
	cloudinaryWidget(
		result => {
			const imgResult = result[0];
			const { secure_url } = imgResult;
			onSuccess(secure_url);
		},
		error => {
			console.error(error);
			if (error !== "User closed widget") {
				notifications.show({
					message: "Image failed to upload.",
					variant: "error"
				});
			}
		},
		["event-images"],
		{
			cropping: true,
			cropping_coordinates_mode: "custom",
			cropping_aspect_ratio: 2.0
		}
	);
};

const CustomCardMedia = props => {
	const { classes, src, alt, caption, onUrlUpdate, noMediaTitle, showCoverImage, onChangeCoverImage } = props;

	const onUploadClick = () => {
		uploadWidget(url => onUrlUpdate(url));
	};

	if (src) {
		const coverImageCheckbox = (
			<div className={classes.checkboxContainer}>
				<CheckBox labelClass={classes.caption} active={showCoverImage} onClick={onChangeCoverImage}>
					Use frosted event image as event cover image on the web
				</CheckBox>
			</div>
		);

		return (
			<div className={classes.root}>
				<MaintainAspectRatio heightRatio={0.5}>
					<CardMedia className={classes.media} image={src} title={alt}/>
				</MaintainAspectRatio>

				<div className={classes.bottomRowContainer}>
					<Hidden smDown>
						{coverImageCheckbox}
					</Hidden>

					<div className={classes.iconDiv}>
						<div className={classes.captionContainer}>
							<Typography className={classes.caption}>{caption}</Typography>
						</div>

						<Avatar className={classes.iconOuter} onClick={onUploadClick}>
							<img
								alt="Card"
								src={"/icons/camera-white.svg"}
								className={classes.icon}
							/>
						</Avatar>
					</div>
				</div>

				<Hidden mdUp>
					{coverImageCheckbox}
				</Hidden>
			</div>
		);
	}

	return (
		<div className={classes.noMedia} onClick={onUploadClick}>
			<div className={classes.noMediaContent}>
				<img
					alt="Card"
					src={"/icons/camera-white.svg"}
					className={classes.noMediaIcon}
				/>
				<Typography variant="title" className={classes.noMediaText}>
					{noMediaTitle}
				</Typography>
				<Typography variant="caption" className={classes.noMediaText}>
					{caption}
				</Typography>
			</div>
		</div>
	);
};

CustomCardMedia.propTypes = {
	classes: PropTypes.object.isRequired,
	src: PropTypes.string,
	caption: PropTypes.string,
	onUrlUpdate: PropTypes.func.isRequired,
	alt: PropTypes.string.isRequired,
	noMediaTitle: PropTypes.string.isRequired,
	showCoverImage: PropTypes.bool.isRequired,
	onChangeCoverImage: PropTypes.func.isRequired
};

export default withStyles(styles)(CustomCardMedia);
