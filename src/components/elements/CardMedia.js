import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import CardMedia from "@material-ui/core/CardMedia";
import notifications from "../../stores/notifications";
import cloudinaryWidget from "../../helpers/cloudinaryWidget";

const height = 480;

const styles = theme => ({
	media: {
		height
	},
	noMedia: {
		cursor: "pointer",
		height: height * 0.6,
		backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
		padding: theme.spacing.unit * 5,
		marginBottom: theme.spacing.unit * 5
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
	caption: {
		textAlign: "right",
		paddingTop: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
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
		marginBottom: theme.spacing.unit * 2
	},
	noMediaText: {
		color: "#FFF"
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
	const { classes, src, alt, caption, onUrlUpdate, noMediaTitle } = props;

	const onUploadClick = () => {
		uploadWidget(url => onUrlUpdate(url));
	};

	if (src) {
		return (
			<div>
				<CardMedia className={classes.media} image={src} title={alt} />

				<div className={classes.iconDiv}>
					<div className={classes.caption}>
						<Typography variant="caption">{caption}</Typography>
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
	noMediaTitle: PropTypes.string.isRequired
};

export default withStyles(styles)(CustomCardMedia);
