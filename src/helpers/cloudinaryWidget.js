export default (onResult, onError, tags = [], options = {}) => {
	cloudinary.openUploadWidget(
		{
			resource_type: "image",
			theme: "minimal",
			multiple: false,
			cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
			upload_preset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
			api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
			tags,
			...options
		},
		(error, result) => {
			if (error) {
				//Skip error not worth reporting
				if (error.message !== "User closed widget") {
					onError(error);
				}
			} else {
				onResult(result);
			}
		}
	);
};
