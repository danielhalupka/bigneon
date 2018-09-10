export default (onResult, onError) => {
	cloudinary.openUploadWidget(
		{
			cloud_name: "bigneon-dev",
			upload_preset: "dthcf8uc",
			tags: ["profile-pictures"],
			api_key: "263756936281765"
		},
		(error, result) => {
			if (error) {
				onError(error);
			} else {
				onResult(result);
			}
		}
	);
};
