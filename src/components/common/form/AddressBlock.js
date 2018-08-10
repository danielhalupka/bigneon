import React, {Component} from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";

import InputGroup from "../../common/form/InputGroup";

const styles = theme => {
	return {
		formControl: {
			width: "100%"
		},
		search: {
			textAlign: "center",
			fontSize: theme.typography.body1.fontSize
		},
		paper: {
			padding: theme.spacing.unit,
			marginBottom: theme.spacing.unit
		}
	};
};

class AddressBlock extends Component {

	constructor(props) {
		super(props);
		this.state = Object.assign({
			address: '',
			city: '',
			state: '',
			country: '',
			zip: '',
			latitude: '',
			longitude: '',
		}, props.address);
	}

	render() {
		const {
			address,
			city,
			state,
			country,
			zip,
			latitude,
			longitude
		} = this.state;
		const {onAddressChange} = this.props;
		const propState = this.state;

		return (
			<div>
				<InputGroup
					value={address}
					name={'address'}
					onChange={e => {
						this.setState({ address: e.target.value });
						onAddressChange(propState);

					}}
					placeholder={'Address'}
				/>
				<InputGroup
					value={city}
					name={'city'}
					onChange={e => this.setState({ city: e.target.value })}
					placeholder={'City'}
				/>
				<InputGroup
					value={state}
					name={'state'}
					onChange={e => this.setState({ state: e.target.value })}
					placeholder={'State'}
				/>
				<InputGroup
					value={country}
					name={'country'}
					onChange={e => this.setState({ country: e.target.value })}
					placeholder={'Country'}
				/>
				<InputGroup
					value={zip}
					name={'zip'}
					onChange={e => this.setState({ zip: e.target.value })}
					placeholder={'Zip'}
				/>
				<InputGroup
					value={latitude}
					name={'latitude'}
					onChange={e => this.setState({ latitude: e.target.value })}
					placeholder={'Latitude'}
				/>
				<InputGroup
					value={longitude}
					name={'longitude'}
					onChange={e => this.setState({ longitude: e.target.value })}
					placeholder={'Longitude'}
				/>

			</div>
		);
	}
}

export default withStyles(styles)(AddressBlock);
