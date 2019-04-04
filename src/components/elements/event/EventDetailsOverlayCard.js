import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "../Card";
import MaintainAspectRatio from "../MaintainAspectRatio";
import optimizedImageUrl from "../../../helpers/optimizedImageUrl";

const styles = theme => ({
	root: {

	},
	media: {
		width: "100%",
		height: "100%",
		backgroundColor: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",

		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",

		paddingLeft: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit
	},
	content: {}
});

class EventDetailsOverlayCard extends Component {
	constructor(props) {
		super(props);

		this.containerDiv = React.createRef();
		this.updateDimensions = this.updateDimensions.bind(this);

		this.currentDivHeight = 0;
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.updateDimensions();
	}

	updateDimensions() {
		const { onHeightChange } = this.props;

		if (onHeightChange && this.containerDiv) {
			const divHeight = this.containerDiv.current.getBoundingClientRect()
				.height;

			//Hard limit just in case an update/render loop creeps in
			if (divHeight > 50000) {
				return;
			}

			if (divHeight !== this.currentDivHeight) {
				this.currentDivHeight = divHeight;
				onHeightChange ? onHeightChange(divHeight) : null;
			}
		}
	}

	render() {
		const { classes, children, header, style } = this.props;

		const imageSrc = this.props.imageSrc ? optimizedImageUrl(this.props.imageSrc) : null;
		return (
			<div ref={this.containerDiv} className={classes.root} style={style}>
				<Card variant="subCard">
					{imageSrc ? (
						<MaintainAspectRatio heightRatio={0.5}>
							<div
								className={classes.media}
								style={{ backgroundImage: `url(${imageSrc})` }}
							/>
						</MaintainAspectRatio>
					) : null}
					{header || null}

					<div className={classes.content}>{children}</div>
				</Card>
			</div>
		);
	}
}

EventDetailsOverlayCard.defaultProps = {
	style: {},
	floating: true
};

EventDetailsOverlayCard.propTypes = {
	classes: PropTypes.object.isRequired,
	style: PropTypes.object,
	imageSrc: PropTypes.string,
	header: PropTypes.any,
	onHeightChange: PropTypes.func,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(EventDetailsOverlayCard);
