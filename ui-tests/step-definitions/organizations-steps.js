var { Given, When } = require("cucumber");

var { adminSideBar, site, menuBar, signInPage } = require("../model");
var organizationsPage = require("../model/pages/organizations");

When("I click on the Organizations menu", async () => {
  await adminSideBar.clickOrganizations();
});

When(
  "I create an organization {string}, {string}, {string}",
  async (name, phone, address) => {
    organizationsPage.clickCreateOrganization();
  }
);
