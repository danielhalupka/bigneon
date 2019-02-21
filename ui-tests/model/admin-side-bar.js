const { client } = require("nightwatch-api");

const adminSideBar = {};
adminSideBar.clickOrganizations = async () => {
	await client.useXpath().click("//*[contains(text(),'Organizations')]");
};

module.exports = adminSideBar;
