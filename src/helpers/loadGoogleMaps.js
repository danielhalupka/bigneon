let isAppended;

export const loadGoogleMaps = () => {
	if (!isAppended) {
		//Load the google API here because we need the a .env var
		if (!process.env.REACT_APP_GOOGLE_PLACES_API_KEY) {
			if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
				console.warn(
					"Please add a REACT_APP_GOOGLE_PLACES_API_KEY value to use google places"
				);
			}
		} else {
			const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
			const script = document.createElement("script");

			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
			document.head.appendChild(script);

			isAppended = true;
		}
	}
};

export default loadGoogleMaps;
