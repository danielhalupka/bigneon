//Accepts venue object and attempts to create the most accurate map link
export default venue => {
	let googleMapsLink = "";
	const { google_places_id, address } = venue;
	if (google_places_id) {
		//TODO check this works once it's added to the API
		//This could even be moved to the back end
		googleMapsLink = `https://www.google.com/maps/place/?q=place_id:${google_places_id}`;
	} else if (address) {
		//Try make a google maps search query for missing places ID
		googleMapsLink = `https://www.google.co.za/maps/place/${address
			.split(" ")
			.join("+")}/`;
	}

	return googleMapsLink;
};
