import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Slide } from "@material-ui/core";

import { fontFamilyDemiBold } from "../../styles/theme";

const styles = theme => {
	return {
		bar: {
			width: "100%",
			position: "fixed",
			bottom: 0,
			left: 0,
			zIndex: "100000",
			justifyContent: "center",
			alignItems: "center",
			padding: theme.spacing.unit,
			backgroundColor: "#FFFFFF",
			borderTop: "1px solid #DEE2E8"
		},
		text: {
			textAlign: "center",
			fontFamily: fontFamilyDemiBold,
			lineHeight: 1,
			fontSize: theme.typography.fontSize * 1.1,
			marginTop: theme.spacing.unit,
			marginBottom: theme.spacing.unit
		}
	};
};

const showOnScrollHeight = 400;

class MobileBottomBarCTA extends Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false
		};

		this.onWindowScroll = this.onWindowScroll.bind(this);
	}

	componentDidMount() {
		window.addEventListener("scroll", this.onWindowScroll);
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.onWindowScroll);
	}

	onWindowScroll() {
		if (window.pageYOffset > showOnScrollHeight && !this.state.show) {
			this.setState({ show: true });
		} else if (window.pageYOffset < showOnScrollHeight && this.state.show) {
			this.setState({ show: false });
		}
	}

	render() {
		const { classes, button, priceRange } = this.props;
		const { show } = this.state;

		return (
			<Slide direction="up" in={show}>
				<div className={classes.bar}>
					{priceRange ? (
						<Typography className={classes.text}>
							{priceRange}
						</Typography>
					) : null}
					{button}
				</div>
			</Slide>
		);
	}
}

MobileBottomBarCTA.propTypes = {
	classes: PropTypes.object.isRequired,
	button: PropTypes.element.isRequired,
	priceRange: PropTypes.string
};

export default withStyles(styles)(MobileBottomBarCTA);
