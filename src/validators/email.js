export default email => {
	const normal = "0-9a-zA-Z\\!#\\$%&'\\*\\+\\-\\/\\=\\?\\^_`\\{\\|\\}~";
	const mix =
		"\\(\\),:;<>@\\[\\](\\\\\\\\)(\\\\\")0-9a-zA-Z\\!#\\$%&'\\*\\+-\\/\\=\\?\\^_`\\{\\|\\}~\\.\\s";

	// local part
	const mixPattern = '"[' + mix + ']*"';
	const normalPattern = "[" + normal + '("")]+?';
	const localPattern = ["^((", normalPattern, "\\.)*", normalPattern, ")"].join(
		""
	);
	// domain part
	const hostnamePattern = "(:?[0-9a-zA-Z\\-]+\\.)*[0-9a-zA-Z\\-]+";
	const ipPattern = "\\[.+?\\]";
	const domainPattern = [
		"(?:(?:",
		hostnamePattern,
		")|(?:",
		ipPattern,
		"))$"
	].join("");

	const pattern = localPattern + "@" + domainPattern;

	const mixreg = new RegExp(mixPattern, "g");
	const reg = new RegExp(pattern, "g");

	// reset regular expression
	reg.lastIndex = 0;
	email = email.replace(mixreg, '""');
	return reg.test(email);
};
