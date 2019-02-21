var { client } = require("nightwatch-api");

let menuBar = {};
menuBar.clickSignIn = async () => {
  await client.useXpath().click("//*[contains(text(),'Sign In')]");
};
menuBar.clickUserProfileMenu = async () => {
  await client
    .useCss()
    .waitForElementVisible("img[alt='User icon']")
    .click("img[alt='User icon']");
};
menuBar.clickMenuItem = async text => {
  const path = "//ul[a[li[contains(text(),'" + text + "')]]]";
  await client
    .useXpath()
    .waitForElementVisible(path)
    .click(path);
};
module.exports = menuBar;
