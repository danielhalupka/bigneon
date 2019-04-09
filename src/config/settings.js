let settings;

export const settingsFactory = () => {
	if (!settings) {
		settings = {
			promoImageAspectRatio: 1920 / 1080
			//TODO add all process.env variables here
		};
	}

	return settings;
};

export default settingsFactory;
