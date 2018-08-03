//Takes a google result and finds the field with the type as key
export default (result, key) => {
	const { address_components } = result;
	for (let index = 0; index < address_components.length; index++) {
		const component = address_components[index];
		const { types, long_name } = component;
		if (types.indexOf(key) > -1) {
			return long_name;
		}
	}
	return "";
};
