/* eslint-disable no-useless-escape */
const { Given, When } = require("cucumber");

const { site, menuBar, signInPage } = require("../model");
const { sleep } = require("../util");

Given(/^I have opened the site/, async () => {
	await site.open();
});

When(/^I click Sign in/, async () => {
	await menuBar.clickSignIn();
});

When(
	/^I enter username "(.*?)" and password "(.*?)"/,
	async (username, password) => {
		await signInPage.signIn(username, password);
	}
);

When(/^I click on the user profile dropdown/, async () => {
	await menuBar.clickUserProfileMenu();
});

When(/^I click on the menu item "(.*?)"/, async text => {
	await menuBar.clickMenuItem(text);
});

Given(/^I have logged in as \"([^\"]*)\"$/, async user => {
	await site.open();
	await menuBar.clickSignIn();
	await signInPage.signIn("superuser@test.com", "password");
});

Given(/^I have opened Big Neon Studio$/, async () => {
	await menuBar.clickUserProfileMenu();
	await menuBar.clickMenuItem("Admin");
});

// Ideally you want to test that a page has loaded etc, but these are some
// hack/helper methods to help while developing the test. Replace them later
// with check that an element is present or clickable
When(/^I wait (.*) seconds/, async seconds => {
	await sleep(seconds * 1000);
});

When(/^I wait (.*) milliseconds/, async ms => {
	await sleep(ms * 1000);
});
