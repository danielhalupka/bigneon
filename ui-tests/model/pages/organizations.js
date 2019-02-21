var { client } = require("nightwatch-api");

let organizationsPage = {};
organizationsPage.clickCreateOrganization = async () => {
  await client
    .useXpath()
    .click("//button[span[contains(text(),'Create Organization')]]");
};
module.exports = organizationsPage;
