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
		this.state = {
			address: '',
			city: '',
			state: '',
			country: '',
			zip: '',
			latitude: '',
			longitude: '',
		};
	}

	static getDerivedStateFromProps(props, state) {
		state = Object.assign(state, props.address);
		return state;
	}

	setValue(key, value) {
		const {onChange, returnGoogleObject} = this.props;
		this.state[key] = value;
		let result = this.state;
		if (returnGoogleObject) {
			result = this.getGoogleObject();
		}
		onChange(this.state.address, result);

	}

	getGoogleObject() {
		let latitude = this.state.latitude;
		let longitude = this.state.longitude;
		const googleObject = {
			address_components: [
				{
					"long_name": this.state.address,
					"short_name":this.state.address,
					"types": [
						"street_number"
					]
				},
				{
					"long_name": this.state.address,
					"short_name": this.state.address,
					"types": [
						"route"
					]
				},
				{
					"long_name": this.state.city,
					"short_name": this.state.city,
					"types": [
						"political",
						"sublocality",
						"sublocality_level_1"
					]
				},
				{
					"long_name": this.state.city,
					"short_name": this.state.city,
					"types": [
						"locality",
						"political"
					]
				},
				{
					"long_name": this.state.city,
					"short_name": this.state.city,
					"types": [
						"administrative_area_level_2",
						"political"
					]
				},
				{
					"long_name": this.state.state,
					"short_name": this.state.state,
					"types": [
						"administrative_area_level_1",
						"political"
					]
				},
				{
					"long_name": this.state.country,
					"short_name":this.state.country,
					"types": [
						"country",
						"political"
					]
				},
				{
					"long_name": this.state.zip,
					"short_name": this.state.zip,
					"types": [
						"postal_code"
					]
				}
			],
			formatted_address: this.state.address,
			geometry: {
				location: {
					lat: () => latitude,
					lng: () => longitude
				}
			},
			location_type: "",
			viewport: {
				south: 0,
				west: 0,
				north: 0,
				east: 0
			},
			place_id: "",
			types: ["street_address"]
		};
		return [googleObject];
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

		return (
			<div>
				<InputGroup
					value={address}
					label="Address"
					name={'address'}
					onChange={e => {
						this.setValue('address', e.target.value);
					}}
					placeholder={'Address'}
				/>
				<InputGroup
					value={city}
					label="City"
					name={'city'}
					onChange={e => {
						this.setValue('city', e.target.value)
					}
					}
					placeholder={'City'}
				/>
				<InputGroup
					value={state}
					label="State"
					name={'state'}
					onChange={e => {
						this.setValue('state', e.target.value)
					}
					}
					placeholder={'State'}
				/>
				<InputGroup
					value={country}
					label="Country"
					name={'country'}
					onChange={e => {
						this.setValue('country', e.target.value)
					}
					}
					placeholder={'Country'}
				/>
				<InputGroup
					value={zip}
					label="Zip"
					name={'zip'}
					onChange={e => {
						this.setValue('zip', e.target.value)
					}
					}
					placeholder={'Zip'}
				/>
				<InputGroup
					value={latitude}
					label="Latitude"
					name={'latitude'}
					onChange={e => {
						this.setValue('latitude', e.target.value)
					}
					}
					placeholder={'Latitude'}
				/>
				<InputGroup
					value={longitude}
					label="Longitude"
					name={'longitude'}
					onChange={e => {
						this.setValue('longitude', e.target.value)
					}
					}
					placeholder={'Longitude'}
				/>

			</div>
		);
	}
}

export default withStyles(styles)(AddressBlock);
