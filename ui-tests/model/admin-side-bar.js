var { client } = require("nightwatch-api");

let adminSideBar = {};
adminSideBar.clickOrganizations = async () => {
  await client.useXpath().click("//*[contains(text(),'Organizations')]");
};

module.exports = adminSideBar;
