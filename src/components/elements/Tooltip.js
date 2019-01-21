import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Zoom from "@material-ui/core/Zoom";
import { fontFamilyDemiBold } from "../styles/theme";
import { Typography } from "@material-ui/core";

const styles = theme => ({
	background: {
		backgroundColor: theme.palette.secondary.main,
		boxShadow: "none",
		marginBottom: 6
	},
	title: {
		textAlign: "center",
		color: "#FFFFFF",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.9
	},
	text: {
		color: "#FFFFFF",
		textAlign: "center",
		fontSize: theme.typography.fontSize * 0.8
	},
	arrowPopper: {
		'&[x-placement*="bottom"] $arrowArrow': {
			top: 0,
			left: 0,
			marginTop: "-0.9em",
			width: "3em",
			height: "1em",
			"&::before": {
				borderWidth: "0 1em 1em 1em",
				borderColor: `transparent transparent ${
					theme.palette.secondary.main
				} transparent`
			}
		},
		'&[x-placement*="top"] $arrowArrow': {
			bottom: 0,
			left: 0,
			marginBottom: "-0.9em",
			width: "3em",
			height: "1em",
			"&::before": {
				borderWidth: "1em 1em 0 1em",
				borderColor: `${
					theme.palette.secondary.main
				} transparent transparent transparent`
			}
		},
		'&[x-placement*="right"] $arrowArrow': {
			left: 0,
			marginLeft: "-0.9em",
			height: "3em",
			width: "1em",
			"&::before": {
				borderWidth: "1em 1em 1em 0",
				borderColor: `transparent ${
					theme.palette.secondary.main
				} transparent transparent`
			}
		},
		'&[x-placement*="left"] $arrowArrow': {
			right: 0,
			marginRight: "-0.9em",
			height: "3em",
			width: "1em",
			"&::before": {
				borderWidth: "1em 0 1em 1em",
				borderColor: `transparent transparent transparent ${
					theme.palette.secondary.main
				}`
			}
		}
	},
	arrowArrow: {
		position: "absolute",
		fontSize: 7,
		width: "3em",
		height: "3em",
		"&::before": {
			content: '""',
			margin: "auto",
			display: "block",
			width: 0,
			height: 0,
			borderStyle: "solid"
		}
	}
});

class CustomTooltip extends Component {
	constructor(props) {
		super(props);
		this.state = {
			arrowRef: null
		};
	}

	handleArrowRef = node => {
		this.setState({
			arrowRef: node
		});
	};

	render() {
		const { classes, children, title, text, placement } = this.props;

		return (
			<Tooltip
				TransitionComponent={Zoom}
				title={(
					<React.Fragment>
						{title ? (
							<Typography className={classes.title}>{title}</Typography>
						) : null}
						{text ? (
							<Typography className={classes.text}>{text}</Typography>
						) : null}
						<span className={classes.arrowArrow} ref={this.handleArrowRef}/>
					</React.Fragment>
				)}
				classes={{ popper: classes.arrowPopper, tooltip: classes.background }}
				placement={placement}
				PopperProps={{
					popperOptions: {
						modifiers: {
							arrow: {
								enabled: Boolean(this.state.arrowRef),
								element: this.state.arrowRef
							}
						}
					}
				}}
			>
				{children}
			</Tooltip>
		);
	}
}

CustomTooltip.defaultProps = {
	placement: "top"
};

CustomTooltip.propTypes = {
	classes: PropTypes.object.isRequired,
	placement: PropTypes.oneOf(["top", "bottom", "left", "right"]),
	title: PropTypes.string,
	text: PropTypes.string
};

export default withStyles(styles)(CustomTooltip);
