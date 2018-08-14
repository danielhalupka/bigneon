export default url => {
	const pattern = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
	const reg = new RegExp(pattern, "g");
	return reg.test(url);
};
