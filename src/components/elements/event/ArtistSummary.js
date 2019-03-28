import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import SupportingArtistsLabel from "../../pages/events/SupportingArtistsLabel";
import { fontFamilyBold, fontFamilyDemiBold } from "../../styles/theme";
import Card from "../Card";
import CornerRibbon from "../CornerRibbon";
import SocialIconLink from "../social/SocialIconLink";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";

const styles = theme => ({
	root: {},
	media: {
		width: "100%",
		height: 190,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",

		paddingLeft: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit
	},
	mediaTopRow: {},
	mediaBottomRow: {
		display: "flex",
		justifyContent: "space-between"
	},
	socialLinks: {
		paddingRight: theme.spacing.unit * 4
	},
	name: {
		color: "#FFFFFF",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 1.5
	},
	content: {
		padding: theme.spacing.unit * 2
	},
	bio: {
		lineHeight: 1.5,
		color: "#656d78",
		fontSize: theme.typography.fontSize
	}
});

const ArtistSummary = props => {
	const {
		classes,
		headliner,
		name,
		bio,
		thumb_image_url,
		bandcamp_username,
		facebook_username,
		image_url,
		instagram_username,
		snapchat_username,
		soundcloud_username,
		spotify_id,
		website_url,
		youtube_video_urls
	} = props;

	let imageSrc = thumb_image_url || image_url;
	imageSrc = optimizedImageUrl(imageSrc);

	return (
		<Card variant="subCard">
			<div
				className={classes.media}
				style={{
					backgroundImage: `linear-gradient(to top, #000000, rgba(0, 0, 0, 0)), url(${imageSrc})`
				}}
			>
				<div className={classes.mediaTopRow}>
					{headliner ? <CornerRibbon>Headliner</CornerRibbon> : null}
				</div>
				<div className={classes.mediaBottomRow}>
					<Typography className={classes.name}>{name}</Typography>

					<div className={classes.socialLinks}>
						{facebook_username ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"facebook"}
								userName={facebook_username}
								size={30}
							/>
						) : null}

						{instagram_username ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"instagram"}
								userName={instagram_username}
								size={30}
							/>
						) : null}
						{snapchat_username ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"snapchat"}
								userName={snapchat_username}
								size={30}
							/>
						) : null}

						{soundcloud_username ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"soundcloud"}
								userName={soundcloud_username}
								size={30}
							/>
						) : null}

						{bandcamp_username ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"bandcamp"}
								userName={bandcamp_username}
								size={30}
							/>
						) : null}

						{website_url ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"website"}
								href={website_url}
								size={30}
							/>
						) : null}

						{spotify_id ? (
							<SocialIconLink
								style={{ marginLeft: 6 }}
								icon={"spotify"}
								userName={spotify_id}
								size={30}
							/>
						) : null}
					</div>
				</div>
			</div>
			{bio ? (
				<div className={classes.content}>
					<Typography className={classes.bio}>{bio}</Typography>
				</div>
			) : null}
		</Card>
	);
};

ArtistSummary.propTypes = {
	classes: PropTypes.object.isRequired,
	headliner: PropTypes.bool,
	name: PropTypes.string.isRequired
};

export default withStyles(styles)(ArtistSummary);
