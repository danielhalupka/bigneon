import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { fontFamilyBold, fontFamilyDemiBold } from "../../../config/theme";
import SocialIconLink from "../social/SocialIconLink";
import createGoogleMapsLink from "../../../helpers/createGoogleMapsLink";
import Button from "../Button";

const styles = theme => ({
	root: {
		width: "100%",
		backgroundColor: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		paddingLeft: "8%",
		paddingRight: "8%",
		paddingBottom: theme.spacing.unit * 4,
		display: "flex",
		alignItems: "flex-end"
	},
	venueName: {
		color: "#FFFFFF",
		fontSize: theme.typography.fontSize * 3,
		fontFamily: fontFamilyDemiBold,
		lineHeight: 1
	},
	address: {
		color: "#9da3b4",
		lineHeight: 1,
		fontSize: theme.typography.fontSize * 1.1
	},
	socialLinks: {
		marginTop: theme.spacing.unit * 2
	},
	mapLink: {
		display: "flex",
		alignItems: "center"
	},
	viewOnMap: {
		color: "#FFFFFF",
		fontSize: theme.typography.fontSize * 0.9,
		lineHeight: 1
	},
	locationIcon: {
		width: 14,
		height: "auto",
		marginRight: 5
	},
	rightOptionsContainer: {
		display: "flex",
		justifyContent: "flex-end"
	}
});

const VenueHeaderImage = props => {
	const { classes, venue, height } = props;

	const { name, address, promo_image_url } = venue; //TODO promo_image_url field name might be different
	const imgUrl = promo_image_url || "/images/venue-placeholder.png";
	const googleMapsLink = createGoogleMapsLink(venue);

	return (
		<div
			className={classes.root}
			style={{
				backgroundImage: `url(${imgUrl})`,
				height
			}}
		>
			<Grid container alignItems="flex-end">
				<Grid item xs={12} sm={12} md={8} lg={8}>
					<Typography className={classes.venueName}>{name}</Typography>
					<Typography className={classes.address}>{address}</Typography>
					<div className={classes.socialLinks}>
						<SocialIconLink
							icon="facebook"
							size={30}
							style={{ marginRight: 5 }}
						/>
						<SocialIconLink
							icon="twitter"
							size={30}
							style={{ marginRight: 5 }}
						/>
						<SocialIconLink
							icon="website"
							size={30}
							style={{ marginRight: 5 }}
						/>
					</div>
				</Grid>

				<Grid
					item
					xs={12}
					sm={12}
					md={4}
					lg={4}
					className={classes.rightOptionsContainer}
				>
					<a href={googleMapsLink} target="_blank" className={classes.mapLink}>
						<img
							className={classes.locationIcon}
							src="/icons/location-multi.svg"
						/>
						<Typography className={classes.viewOnMap}>View on map</Typography>
					</a>

					{/* <Button>Add to favorites</Button> */}
				</Grid>
			</Grid>
		</div>
	);
};

VenueHeaderImage.defaultProps = {
	height: 450
};

VenueHeaderImage.propTypes = {
	classes: PropTypes.object.isRequired,
	venue: PropTypes.object.isRequired,
	height: PropTypes.number
};

export default withStyles(styles)(VenueHeaderImage);
