const { client } = require("nightwatch-api");

const site = {};

site.open = async () => {
	await client.url("https://develop.bigneon.com");
};

site.login = async (username, password) => {};
module.exports = site;
