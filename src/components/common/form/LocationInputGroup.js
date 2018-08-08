//TODO Required API key in .env REACT_APP_GOOGLE_PLACES_API_KEY
//Enable: Geolocation API, Maps JavaScript API, Places API for Web, Geocoding API
import React from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng
} from "react-places-autocomplete";

import { primaryHex } from "../../styles/theme";

const styles = theme => {
	return {
		formControl: {
			marginTop: theme.spacing.unit * 2,
			width: "100%"
		}
	};
};

class LocationInputGroup extends React.Component {
	onSelect(address) {
		console.log("address");
		console.log(address);
		const {
			onAddressChange,
			onLatLngResult,
			onFullResult,
			onError
		} = this.props;

		onAddressChange(address);

		geocodeByAddress(address)
			.then(results => {
				console.log("results");
				console.log(results);
				onFullResult(results[0]);
				return getLatLng(results[0]);
			})
			.then(latLng => {
				onLatLngResult(latLng);
			})
			.catch(error => onError(error));
	}

	render() {
		const {
			address,
			placeholder,
			onAddressChange,
			error,
			onError,
			label,
			classes
		} = this.props;

		if (window.google === undefined) {
			return false;
		}

		return (
			<div>
				<PlacesAutocomplete
					value={address}
					onChange={onAddressChange}
					onSelect={this.onSelect.bind(this)}
					onError={onError}
				>
					{({
						getInputProps,
						suggestions,
						getSuggestionItemProps,
						loading
					}) => (
						<div>
							<FormControl
								className={classes.formControl}
								aria-describedby={`location`}
								error
							>
								<TextField
									{...getInputProps({
										placeholder:
											placeholder || "e.g. Tari Labs, Oakland, San Francisco",
										className: "location-search-input"
									})}
									error={!!error}
									label={label}
								/>
								<FormHelperText id={`${name}-error-text`}>
									{error}
								</FormHelperText>
							</FormControl>

							<div className="autocomplete-dropdown-container">
								{loading && (
									<div style={{ marginTop: 5, marginBottom: 5 }}>
										<Typography variant="caption">Loading...</Typography>
									</div>
								)}
								{suggestions.map(suggestion => {
									const className = suggestion.active
										? "suggestion-item--active"
										: "suggestion-item";
									// inline style for demonstration purpose
									const style = suggestion.active
										? { backgroundColor: primaryHex, cursor: "pointer" }
										: { backgroundColor: "transparent", cursor: "pointer" };
									return (
										<div
											{...getSuggestionItemProps(suggestion, {
												className,
												style
											})}
										>
											<Typography variant="body1">
												{suggestion.description}
											</Typography>
										</div>
									);
								})}

								<div style={{ textAlign: "center" }}>
									<img
										style={{ width: "25%", paddingTop: 5 }}
										src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3_hdpi.png"
									/>
								</div>
							</div>
						</div>
					)}
				</PlacesAutocomplete>
			</div>
		);
	}
}

LocationInputGroup.propTypes = {
	label: PropTypes.string,
	error: PropTypes.string,
	address: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	searchTypes: PropTypes.array,
	onError: PropTypes.func.isRequired,
	onAddressChange: PropTypes.func.isRequired,
	onLatLngResult: PropTypes.func.isRequired,
	onFullResult: PropTypes.func.isRequired
};

export default withStyles(styles)(LocationInputGroup);
