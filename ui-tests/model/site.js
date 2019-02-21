var { client } = require("nightwatch-api");

let site = {};

site.open = async () => {
  await client.url("https://develop.bigneon.com");
};

site.login = async (username, password) => {};
module.exports = site;
