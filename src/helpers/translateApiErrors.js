//Translating the long structured error object returned from the API into a simple message and list of errors
export default (error, defaultMessage = "An an error occurred.") => {
	const result = { message: "", list: [] };

	if (
		error &&
		error.response &&
		error.response.data &&
		error.response.data.error
	) {
		const { fields } = error.response.data;
		if (fields && Object.keys(fields).length > 0) {
			Object.keys(fields).forEach(fieldKey => {
				const field = fields[fieldKey];
				if (Array.isArray(field)) {
					field.forEach(fieldElement => {
						const { message, code, params } = fieldElement;
						if (message) {
							let formattedMessage = message;

							if (
								formattedMessage.charAt(formattedMessage.length - 1) !== "."
							) {
								formattedMessage = `${formattedMessage}.`;
							}

							result.message = `${result.message} ${formattedMessage}`;
						}

						result.list.push({ message, code, params });
					});
				}
			});
		} else if (error.response.data.error) {
			result.message = error.response.data.error;
		}
	}

	if (!result.message) {
		result.message = defaultMessage;
	}

	return result;
};
