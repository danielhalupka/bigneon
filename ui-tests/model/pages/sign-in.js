const { client } = require("nightwatch-api");

const signInPage = {};
signInPage.signIn = async (username, password) => {
	await client
		.useCss()
		.setValue("input#email", username)
		.setValue("input#password", password);

	await client.useXpath().click("//button[span[contains(text(),'Login')]]");
};
module.exports = signInPage;
