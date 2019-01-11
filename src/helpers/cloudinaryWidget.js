export default (onResult, onError, tags = []) => {
	cloudinary.openUploadWidget(
		{
			cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
			upload_preset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
			tags,
			api_key: process.env.REACT_APP_CLOUDINARY_API_KEY
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
