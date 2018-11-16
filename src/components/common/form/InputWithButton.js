import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import { Typography } from "@material-ui/core";

import { fontFamilyDemiBold } from "../../styles/theme";

const styles = theme => {
	return {
		root: {
			width: "100%",
			display: "flex",
			borderStyle: "solid",
			borderColor: "#000000",
			borderRadius: 4,
			borderWidth: 0.5,
			height: 50
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

			display: "flex",
			justifyContent: "center",
			alignItems: "center",

			flex: 1,
			borderLeft: "0.5px solid #000000",
			cursor: "pointer",
			textTransform: "uppercase"
		},
		buttonText: {
			marginTop: 4,
			fontSize: theme.typography.fontSize * 0.95,
			fontFamily: fontFamilyDemiBold
		},
		buttonTextDisabled: {
			color: "gray"
		}
	};
};

class InputWithButton extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: ""
		};
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
			onSubmit
		} = this.props;

		return (
			<div className={classes.root} style={style}>
				<div className={classes.inputContainer}>
					<input
						className={classes.input}
						value={value}
						name={name}
						onChange={e => {
							this.setState({ value: e.target.value });
						}}
						placeholder={placeholder}
					/>
				</div>

				<div
					className={classNames({
						[classes.buttonContainer]: true,
						noselect: true
					})}
					onClick={() => {
						if (!disabled) {
							onSubmit(value);
						}
					}}
				>
					<Typography
						className={classNames({
							[classes.buttonText]: true,
							[classes.buttonTextDisabled]: disabled
						})}
					>
						{buttonText}
					</Typography>
				</div>
			</div>
		);
	}
}

InputWithButton.defaultPropTypes = {
	buttonText: "Submit",
	style: {}
};

InputWithButton.propTypes = {
	classes: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	buttonText: PropTypes.string,
	style: PropTypes.object,
	disabled: PropTypes.bool
};

export default withStyles(styles)(InputWithButton);
