import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";

import notifications from "../../../stores/notifications";
import cloudinaryWidget from "../../../helpers/cloudinaryWidget";

const imageSize = 170;

const styles = theme => ({
	root: {
		display: "flex",
		alignItems: "flex-end"
	},
	imageBackground: {
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "50% 50%"
	},
	missingImageContainer: {
		borderStyle: "dashed",
		borderWidth: 0.5,
		borderColor: "#d1d1d1",
		width: imageSize,
		height: imageSize,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	missingImage: {
		width: imageSize * 0.35,
		height: "auto"
	},
	iconDiv: {
		display: "flex",
		justifyContent: "center",
		cursor: "pointer"
	},
	iconOuter: {
		position: "relative",
		right: -imageSize,
		top: -13,
		width: 42,
		height: 42,
		boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)",
		backgroundImage: "linear-gradient(224deg, #e53d96, #5491cc)"
	},
	icon: {
		width: 18,
		height: 18,
		borderRadius: 0
	}
});

const UploadButton = ({ classes, onClick }) => (
	<div className={classes.iconDiv} onClick={onClick}>
		<Avatar className={classes.iconOuter}>
			<Avatar
				alt="Card"
				src={"/icons/camera-white.svg"}
				className={classes.icon}
			/>
		</Avatar>
	</div>
);

class ProfilePicture extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {}

	uploadWidget() {
		const { onNewUrl } = this.props;

		cloudinaryWidget(
			result => {
				const imgResult = result[0];
				const { secure_url } = imgResult;
				onNewUrl(secure_url);
			},
			error => {
				console.error(error);

				notifications.show({
					message: "Profile picture failed to upload.",
					variant: "error"
				});
			},
			["profile-pictures"],
			{
				cropping: true,
				cropping_coordinates_mode: "custom",
				cropping_aspect_ratio: 1.0
			}
		);
	}

	render() {
		const { classes } = this.props;

		const { profilePicUrl } = this.props;

		return (
			<div className={classes.root}>
				<UploadButton
					classes={classes}
					onClick={this.uploadWidget.bind(this)}
				/>

				{profilePicUrl ? (
					<div
						className={classes.imageBackground}
						style={{ backgroundImage: `url(${profilePicUrl})` }}
					/>
				) : (
					<div className={classes.missingImageContainer}>
						<img
							className={classes.missingImage}
							src={"/images/profile-pic-placeholder.png"}
							alt={"Profile picture"}
						/>
					</div>
				)}
			</div>
		);
	}
}

ProfilePicture.propTypes = {
	profilePicUrl: PropTypes.string,
	onNewUrl: PropTypes.func.isRequired
};

export default withStyles(styles)(ProfilePicture);
