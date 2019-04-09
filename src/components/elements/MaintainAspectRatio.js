//If an image aspect ratio needs to be maintained by adjusting the height based on the current width
//wrap the element in this component and set the child element to have a height of 100%

import React, { Component } from "react";
import PropTypes from "prop-types";

class MaintainAspectRatio extends Component {
	constructor(props) {
		super(props);

		this.state = {
			divWidth: 0
		};

		this.containerDiv = React.createRef();
		this.updateDimensions =  this.updateDimensions.bind(this);
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	}

	updateDimensions() {
		const divWidth = this.containerDiv.current.getBoundingClientRect().width;
		this.setState({ divWidth });
	}

	render() {
		const { divWidth }  = this.state;
		const { aspectRatio, ...props } = this.props;
		const height = divWidth / aspectRatio;

		return <div style={{ height }} ref={this.containerDiv} {...props}/>;
	}
}

MaintainAspectRatio.defaultProps = {
	aspectRatio: 1
};

MaintainAspectRatio.propTypes = {
	aspectRatio: PropTypes.number
};

export default MaintainAspectRatio;
