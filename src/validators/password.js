export default password => {
	//TODO add real validation here, mirror the API when it's in there
	return String(password).length >= 6;
};
