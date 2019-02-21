const { client } = require("nightwatch-api");

const organizationsPage = {};
organizationsPage.clickCreateOrganization = async () => {
	await client
		.useXpath()
		.click("//button[span[contains(text(),'Create Organization')]]");
};
module.exports = organizationsPage;
