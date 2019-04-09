import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import { Typography } from "@material-ui/core";

import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";

const height = 40;

const borderColor = "#D1D1D1";

const styles = theme => {
	return {
		root: {
			width: "100%",
			display: "flex",
			borderStyle: "solid",
			borderColor: borderColor,
			borderRadius: 8,
			borderWidth: 0.5,
			height,
			alignItems: "center",
			backgroundColor: "#FFFFFF"
		},
		successStateRoot: {
			borderColor: secondaryHex,
			borderWidth: 1
		},
		inputContainer: {
			flex: 3,
			padding: theme.spacing.unit / 2,
			paddingLeft: theme.spacing.unit * 2
		},
		input: {
			fontSize: theme.typography.fontSize * 0.9,
			width: "100%",
			height: "100%",
			borderStyle: "none"
		},
		buttonContainer: {
			marginTop: theme.spacing.unit * 1.5,
			marginBottom: theme.spacing.unit * 1.5,
			paddingLeft: theme.spacing.unit * 1.5,
			paddingRight: theme.spacing.unit * 1.5,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			flex: 1,
			borderLeft: `0.5px solid ${borderColor}`,
			cursor: "pointer",
			textTransform: "uppercase"
		},
		buttonText: {
			marginTop: 5,
			fontSize: theme.typography.fontSize * 1.1,
			fontFamily: fontFamilyDemiBold
		},
		buttonTextDisabled: {
			color: "gray"
		},
		buttonTextSuccessState: {
			color: secondaryHex
		},
		icon: {
			height: height * 0.65,
			width: "auto",
			marginLeft: theme.spacing.unit
		}
	};
};

class InputWithButton extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: false
		};
	}

	componentDidUpdate(prevProps) {
		if (this.state.value === false && this.props.value) {
			this.setState({ value: this.props.value });
		}
	}

	handleKeyPress(e) {
		if (e.key === "Enter") {
			this.props.onSubmit(this.state.value);
		}
	}

	render() {
		const { value } = this.state;
		const {
			classes,
			name,
			placeholder,
			buttonText,
			style,
			disabled,
			iconUrl,
			onSubmit,
			toUpperCase,
			onClear,
			showClearButton,
			successState,
			clearText,
			iconStyle
		} = this.props;

		return (
			<div className={classNames({ [classes.root]: true, [classes.successStateRoot]: successState })} style={style}>
				{iconUrl ? <img className={classes.icon} style={iconStyle} src={iconUrl}/> : null}
				<div className={classes.inputContainer}>
					<input
						className={classes.input}
						value={value === false ? "" : value}
						name={name}
						onChange={e => {
							let value = e.target.value;
							if (toUpperCase) {
								value = value.toUpperCase();
							}
							this.setState({ value });
						}}
						placeholder={placeholder}
						onKeyPress={this.handleKeyPress.bind(this)}
					/>
				</div>

				<div
					className={classNames({
						[classes.buttonContainer]: true,
						noselect: true
					})}
					onClick={() => {
						if (!disabled) {
							if (showClearButton) {
								this.setState({ value: "" });
								onClear();
							} else {
								onSubmit(value);
							}
						}
					}}
				>
					<Typography
						className={classNames({
							[classes.buttonText]: true,
							[classes.buttonTextSuccessState]: successState,
							[classes.buttonTextDisabled]: disabled
						})}
					>
						{showClearButton ? clearText : buttonText}
					</Typography>
				</div>
			</div>
		);
	}
}

InputWithButton.defaultPropTypes = {
	buttonText: "Submit",
	style: {},
	clearText: "clear",
	iconStyle: {}
};

InputWithButton.propTypes = {
	classes: PropTypes.object.isRequired,
	value: PropTypes.string,
	onSubmit: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	buttonText: PropTypes.string,
	style: PropTypes.object,
	iconUrl: PropTypes.string,
	toUpperCase: PropTypes.bool,
	disabled: PropTypes.bool,
	onClear: PropTypes.func,
	showClearButton: PropTypes.bool,
	successState: PropTypes.bool,
	clearText: PropTypes.string,
	iconStyle: PropTypes.object
};

export default withStyles(styles)(InputWithButton);
